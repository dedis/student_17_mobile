const Dialog = require("ui/dialogs");
const Crypto = require("../../../shared/lib/dedjs/Crypto");
const Convert = require("../../../shared/lib/dedjs/Convert");
const User = require("../../../shared/lib/dedjs/object/user/User").get;

const viewModel = User.getKeyPairModule();

let textFieldPublic = undefined;
let textFieldPrivate = undefined;
let textFieldPublicComplete = undefined;

let pageObject = undefined;

function onLoaded(args) {
  const page = args.object;
  pageObject = page.parent.page;

  loadViews(page);
  if (textFieldPublic === undefined || textFieldPrivate === undefined || textFieldPublicComplete === undefined) {
    throw new Error("one of the fields is undefined, but it shouldn't");
  }

  page.bindingContext = viewModel;
}

/**
 * Loads the needed views of the text fields.
 * @param page - the current page object
 */
function loadViews(page) {
  textFieldPublic = page.getViewById("text-field-public");
  textFieldPrivate = page.getViewById("text-field-private");
  textFieldPublicComplete = page.getViewById("text-field-public-complete");
}

/**
 * Function that gets called when the user wants to generate a new key pair.
 * @returns {Promise.<any>}
 */
function generateKeyPair() {
  function setNewKeyPair() {
    const newKeyPair = Crypto.generateRandomKeyPair();

    return User.setKeyPair(newKeyPair, true)
      .then(() => {
        return Dialog.alert({
          title: "New Key Pair",
          message: "The new key pair has been stored in your settings." +
            "\n\nPublic:\n" + Convert.byteArrayToBase64(newKeyPair.public) +
            "\n\nPrivate:\n" + Convert.byteArrayToBase64(newKeyPair.private) +
            "\n\nPublic Complete:\n" + Convert.byteArrayToBase64(newKeyPair.publicComplete),
          okButtonText: "Ok"
        });
      })
      .catch(error => {
        console.log(error);
        console.dir(error);
        console.trace();

        return Dialog.alert({
          title: "Key Pair Generation Error",
          message: "An unexpected error occurred. Please try again. - " + error,
          okButtonText: "Ok"
        });

        return Promise.reject(error);
      });
  }

  if (!User.isKeyPairSet()) {
    return setNewKeyPair();
  } else {
    return Dialog.confirm({
      title: "Old Key Pair Overwriting",
      message: "There is already a key pair stored in you settings. Do you" +
        " want to overwrite it and generate a new key pair?",
      okButtonText: "Yes",
      cancelButtonText: "Cancel"
    })
      .then(result => {
        if (result) {
          return setNewKeyPair();
        }

        return Promise.resolve();
      });
  }
}

/**
 * Function called when the "QR" button has been pressed, we then navigate to the QR code display frame.
 * @returns {Promise.<any>}
 */
function displayQrOfPublicKey() {
  if (User.isKeyPairSet()) {
    const keyPair = User.getKeyPair();
    delete keyPair.private;

    pageObject.showModal("shared/pages/qr-code/qr-code-page", {
      textToShow: Convert.objectToJson(keyPair)
    }, () => { }, true);
  } else {
    return Dialog.alert({
      title: "Please Generate a Key Pair",
      message: "You have to generate a key pair first.",
      okButtonText: "Ok"
    });
  }
}

function resetUser() {
  return Dialog.confirm({
    title: "ALERT",
    message: "You are about to completely reset the user, this action can NOT be undone! Please confirm.",
    okButtonText: "Reset",
    cancelButtonText: "Cancel"
  })
    .then(result => {
      if (result) {
        return User.reset()
          .then(() => {
            return Dialog.alert({
              title: "User Has Been Reset",
              message: "Everything belonging to the user has been completely reset.",
              okButtonText: "Ok"
            });
          });
      }

      return Promise.resolve();
    })
    .catch(error => {
      console.log(error);
      console.dir(error);
      console.trace();

      return Dialog.alert({
        title: "Error",
        message: "An unexpected error occurred. Please try again. - " + error,
        okButtonText: "Ok"
      });

      return Promise.reject(error);
    });
}

module.exports.onLoaded = onLoaded;
module.exports.generateKeyPair = generateKeyPair;
module.exports.displayQrOfPublicKey = displayQrOfPublicKey;
module.exports.resetUser = resetUser;

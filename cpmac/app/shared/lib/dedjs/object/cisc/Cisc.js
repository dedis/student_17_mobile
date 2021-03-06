const ObservableModule = require("data/observable");
const ObservableArray = require("data/observable-array").ObservableArray;
const Package = require("../../Package");
const ObjectType = require("../../ObjectType");
const Helper = require("../../Helper");
const Net = require("../../Net");
const Convert = require("../../Convert");
const FilesPath = require("../../../../res/files/files-path");
const DecodeType = require("../../DecodeType");
const FileIO = require("../../../../lib/file-io/file-io");
const Crypto = require("../../Crypto");
const RequestPath = require("../../RequestPath");
const CothorityMessages = require("../../protobuf/build/cothority-messages");
const BigNumber = require("bn.js");
const User = require("../user/User").get;
const FrameModule = require("ui/frame");
const HASH = require("hash.js");
const Dialog = require("ui/dialogs");


/**
 * This singleton is the Cisc component of the app. It contains everything needed to interact with the identity skipchain.
 */

/**
 * We define the Cisc class which is the object representing the Cisc component of the app.
 */

class Cisc {
    /**
     * Constructor for the Cisc class.
     */
    constructor() {
        this._isLoaded = false;
        this._identity = {
            "address": "",
            "id": "",
            "label": ""
        };
        this._viewModel = ObservableModule.fromObject({
            devices: new ObservableArray(),
            proposedDevices: new ObservableArray(),
            storage: new ObservableArray(),
            proposedStorage: new ObservableArray(),
            isConnected: false,
            name: "",
            isOnProposed: false
        });
        this._data = {};
        this._proposedData = {};
    }

    /**
     * Getters and Setters.
     */

    /**
     * Gets the isLoaded property of Cisc. It is only  once all the settings have been loaded into memory.
     * @returns {boolean} - a boolean that is true if Cisc has completely been loaded into memory
     */
    isLoaded() {
        return this._isLoaded;
    }

    /**
     * Gets the device list array.
     * @returns {ObservableArray} - an observable array containing all the devices in the identity skipchain
     */
    getDevices() {
        return this.getVMModule().devices;
    }

    /**
     * Gets the proposed device list array.
     * @returns {ObservableArray} - an observable array containing all the proposed devices in the identity skipchain
     */
    getProposedDevices() {
        return this.getVMModule().proposedDevices;
    }

    /**
     * Gets the key/value pairs list array.
     * @returns {ObservableArray} - an observable array containing all the key/value pairs in the identity skipchain
     */
    getStorage() {
        return this.getVMModule().storage;
    }

    /**
     * Gets the proposed key/value list array.
     * @returns {ObservableArray} - an observable array containing all the proposed key/value pairs in the identity skipchain
     */
    getProposedStorage() {
        return this.getVMModule().proposedStorage;
    }

    /**
     * Gets the boolean value showing if the app is connected to a skipchain stored in memory
     * @returns {boolean} - the boolean stored in memory
     */
    getIsConnected() {
        return this.getVMModule().isConnected;
    }

    /**
     * Gets the name stored in memory
     * @returns {name} - the name stored in memory
     */
    getName() {
        return this.getVMModule().name
    }

    /**
     * Gets the viewmodel module.
     * @returns {ObservableModule} - an observable module/object containing everything related to the cisc tab binding context
     */
    getVMModule() {
        return this._viewModel;
    }

    /**
     * Gets the data stored in memory
     * @returns {Data} - the data stored in memory
     */
    getData() {
        return this._data;
    }

    /**
     * Gets the proposedData stored in memory
     * @returns {Data} - the proposed data stored in memory
     */
    getProposedData() {
        return this._proposedData;
    }

    /**
     * Gets the string representing the address to the identity skipchain
     * @returns {string} - the url of the skipchain
     */
    getIdentity() {
        return this._identity;
    }

    /**
     * Sets the new device list array given as parameter.
     * @param {Devices} device - the device field from the data
     * @returns {Promise} - a promise that gets resolved once the new device list array has been set
     */
    setDevicesArray() {
        this.emptyDevicesArray();
        if (this.getData() !== undefined && this.getData() !== null) {
            for (const property in this.getData().device) {
                if (this.getData().device.hasOwnProperty(property)) {
                    const point = this.getData().device[property];
                    this.getVMModule().devices.push({
                        device: {
                            id: property,
                            point: Convert.byteArrayToHex(point.point),
                            showPub: () => Dialog.alert({
                                title: `${property} public key`,
                                message: Convert.byteArrayToHex(point.point),
                                okButtonText: "Ok"
                            })
                        }
                    });
                }
            }
            return Promise.resolve();
        }
    }

    /**
     * Sets the new proposed device list array given as parameter.
     * @param {Array} array - the new proposed device list to set
     * @returns {Promise} - a promise that gets resolved once the new proposed device list array has been set
     */
    setProposedDevicesArray() {
        this.emptyProposedDevicesArray();
        if (this.getProposedData() !== undefined && this.getProposedData() !== null) {
            for (const property in this.getProposedData().device) {
                if (this.getProposedData().device.hasOwnProperty(property)) {
                    const point = this.getProposedData().device[property];
                    this.getVMModule().proposedDevices.push({
                        device: {
                            id: property,
                            point: Convert.byteArrayToHex(point.point),
                            showPub: () => Dialog.alert({
                                title: `${property} public key`,
                                message: Convert.byteArrayToHex(point.point),
                                okButtonText: "Ok"
                            })
                        }
                    });
                }
            }
            return Promise.resolve();
        }
    }

    /**
     * Sets the new key/value pair list array given as parameter.
     * @param {Array} array - the new key/value pair list to set
     * @returns {Promise} - a promise that gets resolved once the new key/value list array has been set
     */
    setStorageArray() {
        this.emptyStorageArray();
        if (this.getData() !== undefined && this.getData() !== null) {
            for (const property in this.getData().storage) {
                if (this.getData().storage.hasOwnProperty(property)) {
                    const value = this.getData().storage[property];
                    let showval;
                    if (property.startsWith("web:")) {
                        const topmost = FrameModule.topmost();
                        let navigationEntry = {
                            moduleName: "drawers/cisc/home/web/web-page",
                            bindingContext: {html: value, data:this.getStorage()},
                            animated: false
                        };
                        showval = () => topmost.navigate(navigationEntry);

                    } else {
                        showval = () => Dialog.alert({
                            title: property,
                            message: value,
                            okButtonText: "Ok"
                        })
                    }
                    console.log("pushing value");
                    this.getStorage().push({
                        keyValuePair: {
                            key: property,
                            value: value,
                            showValue: showval
                        }
                    });
                }
            }
        }
    }

    /**
     * Sets the new proposed key/value pair list array given as parameter.
     * @param {Array} array - the new proposed key/value pair list to set
     * @returns {Promise} - a promise that gets resolved once the new proposed key/value list array has been set
     */
    setProposedStorageArray() {
        this.emptyProposedStorageArray();
        if (this.getProposedData() !== undefined && this.getProposedData() !== null) {
            for (const property in this.getProposedData().storage) {
                if (this.getProposedData().storage.hasOwnProperty(property)) {
                    const value = this.getProposedData().storage[property];
                    let showval;
                    if (property.startsWith("web:")) {
                        const topmost = FrameModule.topmost();
                        let navigationEntry = {
                            moduleName: "drawers/cisc/home/web/web-page",
                            bindingContext: {html: value, data:this.getProposedStorage},
                            animated: false
                        };
                        showval = () => topmost.navigate(navigationEntry);

                    } else {
                        showval = () => Dialog.alert({
                            title: property,
                            message: value,
                            okButtonText: "Ok"
                        })
                    }
                    this.getProposedStorage().push({
                        keyValuePair: {
                            key: property,
                            value: value,
                            showValue: showval
                        }
                    });
                }
            }
        }
    }

    /**
     * set the isConnected parameter from the viewmodel
     * @param bool - the value to assign
     * @returns {Promise} - a promise that get resolved once the value is set
     */
    setIsConnected(bool) {
        if (typeof bool !== "boolean") {
            throw new Error("bool must be a Boolean");
        }
        this.getVMModule().isConnected = bool;
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * set the address parameter from the class
     * @param identityId - the value to assign to the id field
     * @param identityAddress - the value to assign to the address field
     * @param save - a boolean saying if you want the value saved permanently
     * @returns {Promise} - a promise that get resolved once the value is set
     */
    setIdentity(identityId, identityAddress, identityLabel, save) {
        if (typeof save !== "boolean") {
            throw new Error("save must be of type boolean");
        }
        if (typeof identityAddress !== "string") {
            throw new Error("identityAddress must be of type string");
        }
        if (typeof identityId !== "string") {
            throw new Error("identityId must be of type string");
        }
        if (typeof identityLabel !== "string") {
            throw new Error("identityLabel must be of type string");
        }

        const oldIdentity = this.getIdentity();
        this._identity = new Object();
        this._identity.address = identityAddress;
        this._identity.id = identityId;
        this._identity.label = identityLabel;
        if (save) {
            let toWrite;
            toWrite = Convert.objectToJson(this._identity);

            return FileIO.writeStringTo(FilesPath.CISC_IDENTITY_LINK, toWrite)
                .catch((error) => {
                    console.log(error);
                    console.dir(error);
                    console.trace();

                    return this.setIdentity(oldIdentity.id, oldIdentity.address, oldIdentity.label, false)
                        .then(() => {
                            return Promise.reject(error);
                        });
                });
        }

        return Promise.resolve();
    }

    /**
     * set the address parameter from the class
     * @param name - the value to assign
     * @param save - a boolean saying if you want the value saved permanently
     * @returns {Promise} - a promise that get resolved once the value is set
     */
    setName(name, save) {
        if (typeof save !== "boolean") {
            throw new Error("save must be of type boolean");
        }
        if (typeof name !== "string") {
            throw new Error("name must be of type string");
        }

        const oldName = this.getName();
        this.getVMModule().name = name;
        if (save) {
            let toWrite;
            let obj = new Object();
            obj.name = name;
            toWrite = Convert.objectToJson(obj);

            return FileIO.writeStringTo(FilesPath.CISC_NAME, toWrite)
                .catch((error) => {
                    console.log(error);
                    console.dir(error);
                    console.trace();

                    return this.setName(oldName, false)
                        .then(() => {
                            return Promise.reject(error);
                        });
                });
        }

        return Promise.resolve();
    }

    /**
     * get the data loaded in memory
     * @returns {Data}
     */
    getData() {
        return this._data;
    }

    /**
     * set the data in memory
     * @param data
     * @returns {Promise}
     */
    setData(data) {
        if (!Helper.isOfType(data, ObjectType.DATA)) {
            throw new Error("data must be an instance of Data");
        }
        this._data = data;
        return Promise.resolve();
    }

    /**
     * set the proposed in memory
     * @param data
     * @returns {Promise}
     */
    setProposedData(proposedData) {
        if (proposedData === null || proposedData === undefined ){
            this._proposedData = {};
            return Promise.resolve();
        }
        if (!Helper.isOfType(proposedData, ObjectType.DATA)) {
            throw new Error("proposedData must be an instance of Data");
        }
        this._proposedData = proposedData;
        return Promise.resolve();
    }

    /**
     * Action functions.
     */

    /**
     * Empties the device list array.
     */
    emptyDevicesArray() {
        while (this.getDevices().length > 0) {
            this.getDevices().pop();
        }
    }

    /**
     * Empties the proposed device list array.
     */
    emptyProposedDevicesArray() {
        while (this.getProposedDevices().length > 0) {
            this.getProposedDevices().pop();
        }
    }

    /**
     * Empties the device list array.
     */
    emptyStorageArray() {
        while (this.getStorage().length > 0) {
            this.getStorage().pop();
        }
    }

    /**
     * Empties the device list array.
     */
    emptyProposedStorageArray() {
        while (this.getProposedStorage().length > 0) {
            this.getProposedStorage().pop();
        }
    }

    /**
     * Empties the viewmodel.
     */
    emptyViewModel() {
        const promises = [
            this.emptyDevicesArray(),
            this.emptyProposedDevicesArray(),
            this.emptyStorageArray(),
            this.emptyProposedStorageArray()
        ];

        return Promise.all(promises)
            .then(() => this.setIsConnected(false))
            .catch((error)=>console.log(error))
    }

    /**
     * Adds the new device given as parameter to the list of devices.
     * @param {Device} device - the new device to add
     * @returns {Promise} - a promise that gets resolved once the new device has been added
     */
    addDevice(device) {
        if (!Helper.isOfType(device, ObjectType.DEVICE)) {
            throw new Error("device must be an instance of Device");
        }

        this.getDevices().push(device);
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * Adds the new device given as parameter to the list of proposed devices.
     * @param {Device} device - the new device to add
     * @returns {Promise} - a promise that gets resolved once the new device has been added
     */
    addProposedDevice(device) {
        if (!Helper.isOfType(device, ObjectType.DEVICE)) {
            throw new Error("device must be an instance of Device");
        }

        this.getProposedDevices().push(device);
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * Adds the new key/value pair given as parameter to the storage.
     * @param {KeyValue} keyValue - the new key/value pair to add
     * @returns {Promise} - a promise that gets resolved once the new key/value pair has been added
     */
    addStorage(keyValue) {
        if (!Helper.isOfType(keyValue, ObjectType.keyValue)) {
            throw new Error("device must be an instance of Device");
        }

        this.getStorage().push(keyValue);
        return new Promise((resolve, reject) => resolve())
    }

    /**
     * Adds the new key/value pair given as parameter to the proposed Storage.
     * @param {KeyValue} keyValue - the new key/value pair to add
     * @returns {Promise} - a promise that gets resolved once the new key/value pair has been added
     */
    addProposedStorage(keyValue) {
        if (!Helper.isOfType(keyValue, ObjectType.keyValue)) {
            throw new Error("device must be an instance of Device");
        }

        this.getProposedStorage().push(keyValue);
        return new Promise((resolve, reject) => resolve())

    }

    /**
     * Request the data on the skipchain
     * @returns {Promise.<TResult>}
     */
    updateData() {
        const cothoritySocket = new Net.CothoritySocket();
        const dataUpdateMessage = CothorityMessages.createDataUpdate(Convert.hexToByteArray(this.getIdentity().id));
        let node = CothorityMessages.createServerIdentity(new Uint8Array({}), new Uint8Array({}), this.getIdentity().address,"lelele");
        return cothoritySocket.send(node, RequestPath.IDENTITY_DATA_UPDATE, dataUpdateMessage, DecodeType.DATA_UPDATE_REPLY)
            .then((response) => {
                console.log("data");
                console.dir(response);
                return this.setData(response.data);
            })
    }

    /**
     * Request the proposed data on the skipchain
     * @returns {Promise.<TResult>}
     */
    updateProposedData() {
        console.log("updating proposed data");
        const cothoritySocket = new Net.CothoritySocket();
        const proposeUpdateMessage = CothorityMessages.createProposeUpdate(Convert.hexToByteArray(this.getIdentity().id));
        let node = CothorityMessages.createServerIdentity(new Uint8Array({}), new Uint8Array({}), this.getIdentity().address,"lelele");
        return cothoritySocket.send(node, RequestPath.IDENTITY_PROPOSE_UPDATE, proposeUpdateMessage, DecodeType.DATA_UPDATE_REPLY)
            .then((response) => {
                console.log("proposed data");
                console.dir(response);
                return this.setProposedData(response.data);
            })
    }

    /**
     * Request both the data and the proposed data from the skipchain and ask to update the viewmodel arrays
     * @returns {Promise.<TResult>}
     */
    updateAll() {
        let promises = [this.updateData(), this.updateProposedData()];

        return Promise.all(promises)
            .then(() => {
                    this.setIsConnected(true);
                    promises = [
                        this.setDevicesArray(),
                        this.setProposedDevicesArray(),
                        this.setStorageArray(),
                        this.setProposedStorageArray(),
                    ];
                    return Promise.all(promises)

            })
            .then(()=>{
                for (let i=0; i<this.getProposedStorage().length; i++ ){
                    let item = this.getProposedStorage().getItem(""+i);
                    let NewOrChanged = true;
                    for (let j=0; j<this.getStorage().length; j++ ){
                        let oldItem = this.getStorage().getItem(""+j);
                        if (oldItem.keyValuePair.key === item.keyValuePair.key && oldItem.keyValuePair.value === item.keyValuePair.value){
                            NewOrChanged = false;
                        }
                    }
                    item.keyValuePair.newOrChanged = NewOrChanged;
                    this.getProposedStorage().setItem(""+i,item);
                }
                for (let i=0; i<this.getStorage().length; i++ ){
                    let item = this.getStorage().getItem(""+i);
                    let deleted = true;
                    for (let j=0; j<this.getProposedStorage().length; j++ ){
                        let oldItem = this.getProposedStorage().getItem(""+j);
                        if (oldItem.keyValuePair.key === item.keyValuePair.key && oldItem.keyValuePair.value === item.keyValuePair.value){
                            deleted = false;
                        }
                    }

                    if (deleted) {
                        item.keyValuePair.deleted = "deleted";
                        this.getProposedStorage().push(item);
                    }
                }
                for (let i=0; i<this.getProposedDevices().length; i++ ){
                    let item = this.getProposedDevices().getItem(""+i);
                    let NewOrChanged = true;
                    for (let j=0; j<this.getDevices().length; j++ ){
                        let oldItem = this.getDevices().getItem(""+j);
                        if (item.device.id === oldItem.device.id && item.device.point === oldItem.device.point){
                            NewOrChanged = false;
                        }
                    }
                    item.device.newOrChanged = NewOrChanged;
                    this.getProposedDevices().setItem(""+i,item);
                }

                for (let i=0; i<this.getDevices().length; i++ ){
                    let item = this.getDevices().getItem(""+i);
                    let deleted = true;
                    for (let j=0; j<this.getProposedDevices().length; j++ ){
                        let oldItem = this.getProposedDevices().getItem(""+j);
                        if (item.device.id === oldItem.device.id && item.device.point === oldItem.device.point){
                            deleted = false;
                        }
                    }

                    if (deleted) {
                        item.device.deleted = "deleted";
                        this.getProposedDevices().push(item);
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                console.dir(error);
                console.trace();

                this.setIsConnected(false);
            })
    }

    voteForProposed() {
        let hashedData = this.hashData(this.getProposedData());
        const cothoritySocket = new Net.CothoritySocket();
        let alreadySigned = false;
        if (this.getProposedData().votes[this.getName()] !== null && this.getProposedData().votes[this.getName()] !== undefined) {

            alreadySigned = Crypto.schnorrVerify(Crypto.unmarshal(User.getKeyPairModule().public), Convert.hexToByteArray(hashedData), this.getProposedData().votes[this.getName()])
        }
        if (alreadySigned) {
            return Promise.reject("You already signed the message")
        }

        const secret = new BigNumber(Convert.byteArrayToHex(User.getKeyPair().private), 16);
        const signature = Crypto.schnorrSign(secret, Convert.hexToByteArray(hashedData));
        let node = CothorityMessages.createServerIdentity(new Uint8Array({}), new Uint8Array({}), this.getIdentity().address,"lelele");
        let proposeVoteMessage = CothorityMessages.createProposeVote(Convert.hexToByteArray(this.getIdentity().id), this.getName(), signature);
        return cothoritySocket.send(node, RequestPath.IDENTITY_PROPOSE_VOTE, proposeVoteMessage, DecodeType.PROPOSE_VOTE_REPLY)
    }

    hashData(data) {
        let tab = new Uint8Array(4);
        tab[3] = data.threshold / Math.pow(2, 24);
        tab[2] = (data.threshold % Math.pow(2, 24)) / Math.pow(2, 16);
        tab[1] = (data.threshold % Math.pow(2, 16)) / Math.pow(2, 8);
        tab[0] = (data.threshold % Math.pow(2, 8));
        const dataHash = HASH.sha256()
            .update(tab);

        let devices = [];
        for (let device in data.device) {
            if (data.device.hasOwnProperty(device)) {
                devices.push(device);
            }
        }
        devices.sort();
        for (let i in devices) {
            dataHash.update(this.GetByteArrayFromString(devices[i]));
            dataHash.update(data.device[devices[i]].point);
        }

        let storageKeys = [];
        for (let key in data.storage) {
            if (data.storage.hasOwnProperty(key)) {
                storageKeys.push(key);
            }
        }
        storageKeys.sort();
        for (let i in storageKeys) {
            dataHash.update(this.GetByteArrayFromString(data.storage[storageKeys[i]]));
        }
        return dataHash.digest("hex");
    }

    GetByteArrayFromString(parameter) {
        let mainbytesArray = [];
        for (let i = 0; i < parameter.length; i++)
            mainbytesArray.push(parameter.charCodeAt(i));

        return mainbytesArray;
    }


    /**
     * Load and reset functions and sub-functions to load/reset Cisc.
     */

    /**
     * Completely resets Cisc.
     * @returns {Promise} - a promise that gets resolved once Cisc has been reset
     */
    reset() {
        this._isLoaded = false;
        const promises = [this.emptyViewModel(), this.resetName(), this.resetAddress()];

        return Promise.all(promises)
            .then(() => {
                this._isLoaded = true;

                return Promise.resolve();
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();
                return Promise.reject(error);
            });
    }

    resetName() {
        return this.setName("", true);
    }

    resetAddress() {
        return this.setIdentity("", "","", true);
    }

    /**
     * Main load function.
     * @returns {Promise} - a promise that gets resolved once everything belonging to Cisc has been loaded into memory
     */
    load() {
        this._isLoaded = false;

        const promises = [this.loadAddress(), this.loadName()];

        return Promise.all(promises)
            .then(() => {
                this._isLoaded = true;
                return this.updateAll();
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });
    }

    /**
     * Load the identity address into memory
     * @returns {Promise} that gets resolved once the address is loaded into memory
     */
    loadAddress() {
        return FileIO.getStringOf(FilesPath.CISC_IDENTITY_LINK)
            .then(jsonAddress => {
                const obj = JSON.parse(jsonAddress);
                return this.setIdentity(obj.id, obj.address,obj.label, false)
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });
    }

    /**
     * Load the device name into memory
     * @returns {Promise} that gets resolved once the address is loaded into memory
     */
    loadName() {
        return FileIO.getStringOf(FilesPath.CISC_NAME)
            .then(jsonName => {
                const obj = Convert.jsonToObject(jsonName);
                return this.setName(obj.name, false)
            })
            .catch(error => {
                console.log(error);
                console.dir(error);
                console.trace();

                return Promise.reject(error);
            });
    }

}

/**
 * Now we create a singleton object for Cisc.
 */

// The symbol key reference that the singleton will use.
const CISC_PACKAGE_KEY = Symbol.for(Package.CISC);

// We create the singleton if it hasn't been instanciated yet.
const globalSymbols = Object.getOwnPropertySymbols(global);
const ciscExists = (globalSymbols.indexOf(CISC_PACKAGE_KEY) >= 0);

if (!ciscExists) {
    global[CISC_PACKAGE_KEY] = (function () {
        const newCisc = new Cisc();
        newCisc.load();

        return newCisc;
    })();
}

// Singleton API
const CISC = {};

Object.defineProperty(CISC, "get", {
    configurable: false,
    enumerable: false,
    get: function () {
        return global[CISC_PACKAGE_KEY];
    },
    set: undefined
});

// We freeze the singleton.
Object.freeze(CISC);

// We export only the singleton API.
module.exports = CISC;

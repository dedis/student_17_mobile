const ChaiAsPromised = require("chai-as-promised");
chai.use(ChaiAsPromised);
chai.should();

const BigNumber = require("bn.js");
const Convert = require("../../../shared/lib/dedjs/Convert");
const Helper = require("../../../shared/lib/dedjs/Helper");
const ObjectType = require("../../../shared/lib/dedjs/ObjectType");

const Crypto = require("../../../shared/lib/dedjs/Crypto");

const PRIVATE_KEY = "AWKlOlcTuCHEV/fKX0X1IoAoBU0n1c5iKp/SWRLj3T4=";
const PRIVATE_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PRIVATE_KEY);
const PUBLIC_KEY = "y4JMDWrle6RMV+0BKU92Xbu8+J8VkZ5kV3SvSr2ZxHw=";
const PUBLIC_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PUBLIC_KEY);
const PUBLIC_COMPLETE_KEY = "BBmiuL/uxUuItsuFVQJT4oUv4qZrb1fYQ+GL/ZTpZ43MfMSZvUqvdFdknpEVn/i8u112TykB7VdMpHvlag1Mgss=";
const PUBLIC_COMPLETE_KEY_BYTE_ARRAY = Convert.base64ToByteArray(PUBLIC_COMPLETE_KEY);

const PRIVATE_KEY_BIG_NUMBER = new BigNumber(Convert.base64ToHex(PRIVATE_KEY), 16);
const PUBLIC_KEY_POINT = Crypto.unmarshal(PUBLIC_KEY_BYTE_ARRAY);

let POINTS = ["HkDzpR5Imd7WNx8kl2lJcIVRVn8gfDByJnmlfrYh/zU=", "Fx6zzvJM6VzxfByLY2+uArGPtd2lHKPVmoXGMhdaFCA=", "j53MMKZNdtLlglcK9Ct1YYtkbbEOfq3R8ZoJOFIu6tE="];
POINTS = POINTS.map(publicKey => {
  return Crypto.unmarshal(Convert.base64ToByteArray(publicKey));
});
const POINTS_AGGREGATE = "q+G+7n6FXsY7hpxK3m119GuDHnchS6wqTE0sZE/fOKg=";
const POINTS_AGGREGATE_BYTE_ARRAY = Convert.base64ToByteArray(POINTS_AGGREGATE);

const MESSAGE = new Uint8Array([243, 39, 52, 77, 162, 48, 121, 100, 114, 48]);
const SIGNATURE = "lfrA/C6nvY+pXbV0td869Ln6X8QMkeQofOxhQE+l1zNJA1VlM0mpmdQOKhDbz/ciBMCkFGfjkd3pvma778TaAA==";
const SIGNATURE_BYTE_ARRAY = Convert.base64ToByteArray(SIGNATURE);

describe("Crypto", function () {
  describe("#getKeyPairFromSecret", function () {
    it("should throw an error when the input is not a byte array", function () {
      expect(() => Crypto.getKeyPairFromSecret("PRIVATE_KEY_BIG_NUMBER")).to.throw();
    });

    it("should correctly create a key pair", function () {
      const keyPair = Crypto.getKeyPairFromSecret(PRIVATE_KEY_BYTE_ARRAY);

      keyPair.priv.eq(PRIVATE_KEY_BIG_NUMBER).should.be.true;
      keyPair.pub.eq(PUBLIC_KEY_POINT).should.be.true;
    });
  });

  describe("#aggregatePublicKeys", function () {
    it("should throw an error when the input is not an array", function () {
      expect(() => Crypto.aggregatePublicKeys("POINTS")).to.throw();
    });

    it("should throw an error when the input is an empty array", function () {
      expect(() => Crypto.aggregatePublicKeys([])).to.throw();
    });

    it("should throw an error when the input is not an array of points", function () {
      expect(() => Crypto.aggregatePublicKeys([1, 2, 3])).to.throw();
    });

    it("should correctly compute the aggregate of the points", function () {
      const aggregate = Crypto.aggregatePublicKeys(POINTS);

      aggregate.should.deep.equal(POINTS_AGGREGATE_BYTE_ARRAY);
    });
  });

  describe("#marshal", function () {
    it("should throw an error when the input is not a point", function () {
      expect(() => Crypto.marshal("PUBLIC_KEY_POINT")).to.throw();
    });

    it("should correctly compute the marshal of a point", function () {
      const byteArray = Crypto.marshal(PUBLIC_KEY_POINT);

      byteArray.should.deep.equal(PUBLIC_KEY_BYTE_ARRAY);
    });
  });

  describe("#unmarshal", function () {
    it("should throw an error when the input is not a byte array", function () {
      expect(() => Crypto.unmarshal("PUBLIC_COMPLETE_KEY_BYTE_ARRAY")).to.throw();
    });

    it("should correctly compute the unmarshal of a byte array", function () {
      const point = Crypto.unmarshal(PUBLIC_KEY_BYTE_ARRAY);

      point.eq(PUBLIC_KEY_POINT).should.be.true;
    });
  });

  describe("#schnorrSign", function () {
    it("should throw an error when the secret is not a big number", function () {
      expect(() => Crypto.schnorrSign("PRIVATE_KEY_BIG_NUMBER", MESSAGE)).to.throw();
    });

    it("should throw an error when the message is not a byte array", function () {
      expect(() => Crypto.schnorrSign(PRIVATE_KEY_BIG_NUMBER, "MESSAGE")).to.throw();
    });

    it("should correctly compute the signature of a message", function () {
      const signature = Crypto.schnorrSign(PRIVATE_KEY_BIG_NUMBER, MESSAGE);
      const verify = Crypto.schnorrVerify(PUBLIC_KEY_POINT, MESSAGE, signature);

      verify.should.be.true;
    });
  });

  describe("#schnorrVerify", function () {
    it("should throw an error when the pub is not a point", function () {
      expect(() => Crypto.schnorrVerify("PUBLIC_KEY_POINT", MESSAGE, SIGNATURE_BYTE_ARRAY)).to.throw();
    });

    it("should throw an error when the message is not a byte array", function () {
      expect(() => Crypto.schnorrVerify(PUBLIC_KEY_POINT, "MESSAGE", SIGNATURE_BYTE_ARRAY)).to.throw();
    });

    it("should throw an error when the signature is not a byte array", function () {
      expect(() => Crypto.schnorrVerify(PUBLIC_KEY_POINT, MESSAGE, "SIGNATURE_BYTE_ARRAY")).to.throw();
    });

    it("should correctly verify the signature of a message", function () {
      const verify = Crypto.schnorrVerify(PUBLIC_KEY_POINT, MESSAGE, SIGNATURE_BYTE_ARRAY);

      verify.should.be.true;
    });
  });

  describe("#generateRandomKeyPair", function () {
    it("should return a KeyPair object and the keys should have the right length", function () {
      const keyPair = Crypto.generateRandomKeyPair();

      Helper.isOfType(keyPair, ObjectType.KEY_PAIR).should.be.true;

      //console.log(Convert.byteArrayToBase64(keyPair.public));
      //console.log(Convert.byteArrayToBase64(keyPair.private));
      //console.log(Convert.byteArrayToBase64(keyPair.publicComplete));
    });
  });
});

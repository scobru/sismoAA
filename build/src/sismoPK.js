"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.SismoPK = void 0;
var ethers_1 = require("ethers");
var utils_js_1 = require("ethers/lib/utils.js");
var SismoEncrypted_json_1 = __importDefault(require("../artifacts/contracts/SismoEncrypted.sol/SismoEncrypted.json"));
var contractAddress = "0x350Cf3e534bDF467b22CC5E3AABd737A43DbB208"; // goerliBase
var SismoPK = /** @class */ (function () {
    function SismoPK(externalProvider, appId) {
        this.contractAddress = contractAddress;
        this.externalProvider = externalProvider;
        this.contract = new ethers_1.Contract(this.contractAddress, SismoEncrypted_json_1["default"].abi, this.externalProvider);
        this.appId = appId;
    }
    SismoPK.prototype.createPK = function (vaultId, password) {
        return __awaiter(this, void 0, void 0, function () {
            var signer, contractWithSigner, wallet, privateKey, publicKey, encryptedPK, encryptedPKJson, encryptedPKBytes, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signer = this.externalProvider;
                        contractWithSigner = this.contract.connect(signer);
                        wallet = ethers_1.ethers.Wallet.createRandom();
                        privateKey = wallet.privateKey;
                        publicKey = wallet.publicKey;
                        return [4 /*yield*/, this.encrypt(privateKey, password, vaultId)];
                    case 1:
                        encryptedPK = _a.sent();
                        encryptedPKJson = JSON.stringify(encryptedPK);
                        encryptedPKBytes = ethers_1.ethers.utils.toUtf8Bytes(encryptedPKJson);
                        return [4 /*yield*/, contractWithSigner.setWalletInfo((0, utils_js_1.keccak256)(vaultId), (0, utils_js_1.keccak256)(this.appId), encryptedPKBytes)];
                    case 2:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, encryptedPK];
                }
            });
        });
    };
    SismoPK.prototype.getPK = function (vaultId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var signer, contractWithSigner, encryptedPKBytes, encryptedPKJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signer = this.externalProvider;
                        contractWithSigner = this.contract.connect(signer);
                        return [4 /*yield*/, contractWithSigner.getWalletInfo((0, utils_js_1.keccak256)(vaultId), (0, utils_js_1.keccak256)(this.appId))];
                    case 1:
                        encryptedPKBytes = _a.sent();
                        encryptedPKJson = ethers_1.ethers.utils.toUtf8String(encryptedPKBytes);
                        return [2 /*return*/, this.decrypt(JSON.parse(encryptedPKJson), message)];
                }
            });
        });
    };
    SismoPK.prototype.encrypt = function (privateKey, password, vaultId) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, message;
            return __generator(this, function (_a) {
                wallet = new ethers_1.ethers.Wallet(privateKey);
                message = ethers_1.ethers.utils.defaultAbiCoder.encode(["string", "string"], [password, vaultId]);
                return [2 /*return*/, wallet.encrypt(message)];
            });
        });
    };
    SismoPK.prototype.decrypt = function (encryptedWallet, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ethers_1.ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, message)];
            });
        });
    };
    return SismoPK;
}());
exports.SismoPK = SismoPK;

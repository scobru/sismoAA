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
exports.SismoAA = void 0;
var SismoAA_json_1 = __importDefault(require("../artifacts/contracts/SismoAA.sol/SismoAA.json"));
var SismoAAFactory_json_1 = __importDefault(require("../artifacts/contracts/SismoAAFactory.sol/SismoAAFactory.json"));
var ethers_1 = require("ethers");
var sismo_connect_client_1 = require("@sismo-core/sismo-connect-client");
var factoryAddress = "0xAf86D03027234AFB80d84859D7A9E311FD086560"; // goerliBase
// Encryption and Decryption functions remain the same
var SismoAA = /** @class */ (function () {
    function SismoAA(externalProvider, appId) {
        this.contractAddress = factoryAddress;
        this.externalProvider = externalProvider;
        this.contractFactory = new ethers_1.Contract(this.contractAddress, SismoAAFactory_json_1["default"].abi, // Replace with the actual ABI
        this.externalProvider);
        this.appId = appId;
    }
    SismoAA.prototype.prepareSismoConnect = function (to, value, data) {
        return __awaiter(this, void 0, void 0, function () {
            var CONFIG, AUTHS, SIGNATURE_REQUEST;
            return __generator(this, function (_a) {
                CONFIG = {
                    appId: this.appId
                };
                AUTHS = [{ authType: sismo_connect_client_1.AuthType.VAULT }];
                SIGNATURE_REQUEST = {
                    message: ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "uint256", "bytes"], [to, value, data])
                };
                return [2 /*return*/, {
                        CONFIG: CONFIG,
                        AUTHS: AUTHS,
                        SIGNATURE_REQUEST: SIGNATURE_REQUEST
                    }];
            });
        });
    };
    SismoAA.prototype.createAA = function (vaultId) {
        return __awaiter(this, void 0, void 0, function () {
            var signer, contractWithSigner, tx, fetchAA, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        signer = this.externalProvider;
                        contractWithSigner = this.contractFactory.connect(signer);
                        return [4 /*yield*/, contractWithSigner.createAA(ethers_1.ethers.utils.keccak256(vaultId))];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, contractWithSigner.getAAForVaultId(ethers_1.ethers.utils.keccak256(vaultId))];
                    case 3:
                        fetchAA = _a.sent();
                        return [2 /*return*/, fetchAA];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error in createPKP:", error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SismoAA.prototype.getAA = function (vaultId) {
        return __awaiter(this, void 0, void 0, function () {
            var signer, contractWithSigner, fetchAA, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        signer = this.externalProvider;
                        contractWithSigner = this.contractFactory.connect(signer);
                        return [4 /*yield*/, contractWithSigner.getAAForVaultId(ethers_1.ethers.utils.keccak256(vaultId))];
                    case 1:
                        fetchAA = _a.sent();
                        return [2 /*return*/, fetchAA];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error in getPKP:", error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SismoAA.prototype.execute = function (sismoConnectRespnse, vaultId, txCall) {
        return __awaiter(this, void 0, void 0, function () {
            var nonce, AAaddress, contractAA, signer, contractWithSigner, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        nonce = ethers_1.ethers.utils.randomBytes(32);
                        return [4 /*yield*/, this.getAA(vaultId)];
                    case 1:
                        AAaddress = _a.sent();
                        contractAA = new ethers_1.Contract(AAaddress, SismoAA_json_1["default"].abi, this.externalProvider);
                        signer = this.externalProvider;
                        contractWithSigner = contractAA.connect(signer);
                        return [4 /*yield*/, contractWithSigner.executeTransaction(sismoConnectRespnse, txCall.to, txCall.value, txCall.data, this.appId, nonce)];
                    case 2:
                        result = _a.sent();
                        if (result) {
                            console.log("Tx Success");
                        }
                        else {
                            console.log("Tx Failed");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Error in execute:", error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return SismoAA;
}());
exports.SismoAA = SismoAA;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_js_1 = require("ethers/lib/utils.js");
dotenv_1.default.config();
const contractAddress = "0x34a428Afee5241f3861DB9Fa5067cfD919f9b6a9"; // goerliBase
const contractABI = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "allVaultIds",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "encryptedVaultId",
                type: "bytes32",
            },
            {
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
        ],
        name: "getWalletInfo",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "encryptedVaultId",
                type: "bytes32",
            },
            {
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
            {
                internalType: "bytes",
                name: "walletInfo",
                type: "bytes",
            },
        ],
        name: "setWalletInfo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
class SismoPKP {
    constructor(externalProvider, appId) {
        this.contractAddress = contractAddress;
        this.externalProvider = externalProvider;
        this.contract = new ethers_1.Contract(this.contractAddress, contractABI, this.externalProvider);
        this.appId = appId;
    }
    createPKP(vaultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = this.externalProvider;
            console.log("signer", signer);
            const contractWithSigner = this.contract.connect(signer);
            console.log("contractWithSigner", contractWithSigner);
            const wallet = ethers_1.ethers.Wallet.createRandom();
            console.log("wallet.address", wallet.address);
            const privateKey = wallet.privateKey;
            const publicKey = wallet.publicKey;
            console.log("publicKey", publicKey);
            const encryptedPK = yield this.encrypt(privateKey, vaultId);
            console.log("encryptedPK", encryptedPK);
            console.log("keccak256(vaultId)", (0, utils_js_1.keccak256)(vaultId));
            const encryptedPKJson = JSON.stringify(encryptedPK);
            console.log("Encrypted PK JSON:", encryptedPKJson);
            const encryptedPKBytes = ethers_1.ethers.utils.toUtf8Bytes(encryptedPKJson);
            console.log("Encrypted PK Bytes:", encryptedPKBytes);
            const tx = yield contractWithSigner.setWalletInfo((0, utils_js_1.keccak256)(vaultId), (0, utils_js_1.keccak256)(this.appId), encryptedPKBytes);
            yield tx.wait();
            console.log("Transaction mined!", tx.hash);
            return encryptedPK;
        });
    }
    getPKP(vaultId) {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = this.externalProvider;
            const contractWithSigner = this.contract.connect(signer);
            const encryptedPKBytes = yield contractWithSigner.getWalletInfo((0, utils_js_1.keccak256)(vaultId), (0, utils_js_1.keccak256)(this.appId));
            console.log("Retrieved Encrypted PK Bytes:", encryptedPKBytes);
            const encryptedPKJson = ethers_1.ethers.utils.toUtf8String(encryptedPKBytes);
            console.log("Retrieved Encrypted PK JSON:", encryptedPKJson);
            return this.decrypt(JSON.parse(encryptedPKJson), vaultId);
        });
    }
    encrypt(privateKey, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = new ethers_1.ethers.Wallet(privateKey);
            return wallet.encrypt(password);
        });
    }
    decrypt(encryptedWallet, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return ethers_1.ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, password);
        });
    }
}
exports.default = SismoPKP;

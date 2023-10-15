"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const utils_js_1 = require("ethers/lib/utils.js");
dotenv_1.default.config();
const SismoEncrypted_json_1 = __importDefault(require("../artifacts/contracts/SismoEncrypted.sol/SismoEncrypted.json"));
const contractAddress = "0x350Cf3e534bDF467b22CC5E3AABd737A43DbB208"; // goerliBase
class SismoPK {
    constructor(externalProvider, appId) {
        this.contractAddress = contractAddress;
        this.externalProvider = externalProvider;
        this.contract = new ethers_1.Contract(this.contractAddress, SismoEncrypted_json_1.default.abi, this.externalProvider);
        this.appId = appId;
    }
    async createPK(vaultId, password) {
        const signer = this.externalProvider;
        const contractWithSigner = this.contract.connect(signer);
        const wallet = ethers_1.ethers.Wallet.createRandom();
        const privateKey = wallet.privateKey;
        const publicKey = wallet.publicKey;
        const encryptedPK = await this.encrypt(privateKey, password, vaultId);
        const encryptedPKJson = JSON.stringify(encryptedPK);
        const encryptedPKBytes = ethers_1.ethers.utils.toUtf8Bytes(encryptedPKJson);
        const tx = await contractWithSigner.setWalletInfo((0, utils_js_1.keccak256)(vaultId), (0, utils_js_1.keccak256)(this.appId), encryptedPKBytes);
        await tx.wait();
        return encryptedPK;
    }
    async getPK(vaultId, message) {
        const signer = this.externalProvider;
        const contractWithSigner = this.contract.connect(signer);
        const encryptedPKBytes = await contractWithSigner.getWalletInfo((0, utils_js_1.keccak256)(vaultId), (0, utils_js_1.keccak256)(this.appId));
        const encryptedPKJson = ethers_1.ethers.utils.toUtf8String(encryptedPKBytes);
        return this.decrypt(JSON.parse(encryptedPKJson), message);
    }
    async encrypt(privateKey, password, vaultId) {
        const wallet = new ethers_1.ethers.Wallet(privateKey);
        const message = ethers_1.ethers.utils.defaultAbiCoder.encode(["string", "string"], [password, vaultId]);
        return wallet.encrypt(message);
    }
    async decrypt(encryptedWallet, message) {
        return ethers_1.ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, message);
    }
}
exports.default = SismoPK;

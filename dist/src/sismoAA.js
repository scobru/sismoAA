"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SismoAA_json_1 = __importDefault(require("../artifacts/contracts/SismoAA.sol/SismoAA.json"));
const SismoAAFactory_json_1 = __importDefault(require("../artifacts/contracts/SismoAAFactory.sol/SismoAAFactory.json"));
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const sismo_connect_client_1 = require("@sismo-core/sismo-connect-client");
dotenv_1.default.config();
const factoryAddress = "0xFAb59D31B6fAEe4b29BdDD997b56607aFe66FF4B"; // goerliBase
// Encryption and Decryption functions remain the same
class SismoAA {
    contractAddress;
    externalProvider;
    contractFactory;
    appId;
    constructor(externalProvider, appId) {
        this.contractAddress = factoryAddress;
        this.externalProvider = externalProvider;
        this.contractFactory = new ethers_1.Contract(this.contractAddress, SismoAAFactory_json_1.default.abi, // Replace with the actual ABI
        this.externalProvider);
        this.appId = appId;
    }
    async prepareSismoConnect(to, value, data) {
        const CONFIG = {
            appId: this.appId,
        };
        const AUTHS = [{ authType: sismo_connect_client_1.AuthType.VAULT }];
        const SIGNATURE_REQUEST = {
            message: ethers_1.ethers.utils.defaultAbiCoder.encode(["address", "uint256", "bytes"], [to, value, data]),
        };
        return {
            CONFIG,
            AUTHS,
            SIGNATURE_REQUEST,
        };
    }
    async createAA(vaultId) {
        try {
            const signer = this.externalProvider;
            const contractWithSigner = this.contractFactory.connect(signer);
            const tx = await contractWithSigner.createAA(ethers_1.ethers.utils.keccak256(vaultId));
            await tx.wait();
            const fetchAA = await contractWithSigner.getAAForVaultId(ethers_1.ethers.utils.keccak256(vaultId));
            return fetchAA;
        }
        catch (error) {
            console.error("Error in createPKP:", error);
        }
    }
    async getAA(vaultId) {
        try {
            const signer = this.externalProvider;
            const contractWithSigner = this.contractFactory.connect(signer);
            const fetchAA = await contractWithSigner.getAAForVaultId(ethers_1.ethers.utils.keccak256(vaultId));
            return fetchAA;
        }
        catch (error) {
            console.error("Error in getPKP:", error);
        }
    }
    async execute(sismoConnectRespnse, vaultId, txCall) {
        try {
            const nonce = ethers_1.ethers.utils.randomBytes(32);
            const AAaddress = await this.getAA(vaultId);
            const contractAA = new ethers_1.Contract(AAaddress, SismoAA_json_1.default.abi, this.externalProvider);
            const signer = this.externalProvider;
            const contractWithSigner = contractAA.connect(signer);
            const result = await contractWithSigner.executeTransaction(sismoConnectRespnse, txCall.to, txCall.value, txCall.data, this.appId, nonce);
            if (result) {
                console.log("Tx Success");
            }
            else {
                console.log("Tx Failed");
            }
        }
        catch (error) {
            console.error("Error in execute:", error);
        }
    }
}
exports.default = SismoAA;

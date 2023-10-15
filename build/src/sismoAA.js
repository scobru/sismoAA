import SismoAAABI from "../artifacts/contracts/SismoAA.sol/SismoAA.json";
import SismoAAFactoryABI from "../artifacts/contracts/SismoAAFactory.sol/SismoAAFactory.json";
import { Contract, ethers } from "ethers";
import dotenv from "dotenv";
import { AuthType, } from "@sismo-core/sismo-connect-client";
dotenv.config();
const factoryAddress = "0xFAb59D31B6fAEe4b29BdDD997b56607aFe66FF4B"; // goerliBase
// Encryption and Decryption functions remain the same
export class SismoAA {
    contractAddress;
    externalProvider;
    contractFactory;
    appId;
    constructor(externalProvider, appId) {
        this.contractAddress = factoryAddress;
        this.externalProvider = externalProvider;
        this.contractFactory = new Contract(this.contractAddress, SismoAAFactoryABI.abi, // Replace with the actual ABI
        this.externalProvider);
        this.appId = appId;
    }
    async prepareSismoConnect(to, value, data) {
        const CONFIG = {
            appId: this.appId,
        };
        const AUTHS = [{ authType: AuthType.VAULT }];
        const SIGNATURE_REQUEST = {
            message: ethers.utils.defaultAbiCoder.encode(["address", "uint256", "bytes"], [to, value, data]),
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
            const tx = await contractWithSigner.createAA(ethers.utils.keccak256(vaultId));
            await tx.wait();
            const fetchAA = await contractWithSigner.getAAForVaultId(ethers.utils.keccak256(vaultId));
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
            const fetchAA = await contractWithSigner.getAAForVaultId(ethers.utils.keccak256(vaultId));
            return fetchAA;
        }
        catch (error) {
            console.error("Error in getPKP:", error);
        }
    }
    async execute(sismoConnectRespnse, vaultId, txCall) {
        try {
            const nonce = ethers.utils.randomBytes(32);
            const AAaddress = await this.getAA(vaultId);
            const contractAA = new Contract(AAaddress, SismoAAABI.abi, this.externalProvider);
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

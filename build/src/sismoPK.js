import { Contract, ethers } from "ethers";
import { keccak256 } from "ethers/lib/utils.js";
import SismoEncryptedABI from "../artifacts/contracts/SismoEncrypted.sol/SismoEncrypted.json";
const contractAddress = "0x350Cf3e534bDF467b22CC5E3AABd737A43DbB208"; // goerliBase
export class SismoPK {
    contractAddress;
    externalProvider;
    contract;
    appId;
    constructor(externalProvider, appId) {
        this.contractAddress = contractAddress;
        this.externalProvider = externalProvider;
        this.contract = new Contract(this.contractAddress, SismoEncryptedABI.abi, this.externalProvider);
        this.appId = appId;
    }
    async createPK(vaultId, password) {
        const signer = this.externalProvider;
        const contractWithSigner = this.contract.connect(signer);
        const wallet = ethers.Wallet.createRandom();
        const privateKey = wallet.privateKey;
        const publicKey = wallet.publicKey;
        const encryptedPK = await this.encrypt(privateKey, password, vaultId);
        const encryptedPKJson = JSON.stringify(encryptedPK);
        const encryptedPKBytes = ethers.utils.toUtf8Bytes(encryptedPKJson);
        const tx = await contractWithSigner.setWalletInfo(keccak256(vaultId), keccak256(this.appId), encryptedPKBytes);
        await tx.wait();
        return encryptedPK;
    }
    async getPK(vaultId, message) {
        const signer = this.externalProvider;
        const contractWithSigner = this.contract.connect(signer);
        const encryptedPKBytes = await contractWithSigner.getWalletInfo(keccak256(vaultId), keccak256(this.appId));
        const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);
        return this.decrypt(JSON.parse(encryptedPKJson), message);
    }
    async encrypt(privateKey, password, vaultId) {
        const wallet = new ethers.Wallet(privateKey);
        const message = ethers.utils.defaultAbiCoder.encode(["string", "string"], [password, vaultId]);
        return wallet.encrypt(message);
    }
    async decrypt(encryptedWallet, message) {
        return ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, message);
    }
}

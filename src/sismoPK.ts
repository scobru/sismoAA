import { Contract, Signer, ethers, providers } from "ethers";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { keccak256 } from "ethers/lib/utils.js";
import SismoPKABI from "../artifacts/contracts/SismoPK.sol/SismoPK.json";

const contractAddress = "0x2817967cc376d040cc75e3df7F3D3876f05295bb"; // goerliBase

export class SismoPK {
  private contractAddress: string;
  private externalProvider: providers.JsonRpcProvider | Signer;
  private contract: Contract;
  private appId: string;

  constructor(
    externalProvider: providers.JsonRpcProvider | Signer,
    appId: string
  ) {
    this.contractAddress = contractAddress;
    this.externalProvider = externalProvider;
    this.contract = new Contract(
      this.contractAddress,
      SismoPKABI.abi,
      this.externalProvider
    );
    this.appId = appId;
  }

  async createPK(vaultId: any, password: string) {
    console.log("createPK");
    const signer = this.externalProvider;
    const contractWithSigner = this.contract.connect(signer);
    const wallet = ethers.Wallet.createRandom();

    console.group("Wallet Info");
    console.log("Address: ", wallet.address);
    console.log("Private Key: ", wallet.privateKey);
    console.log("Public Key: ", wallet.publicKey);
    console.groupEnd();

    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;

    const encryptedPK = await this.encrypt(privateKey, password);
    const encryptedPKJson = JSON.stringify(encryptedPK);
    const encryptedPKBytes = ethers.utils.toUtf8Bytes(encryptedPKJson);

    console.group("Encrypted Wallet Info");
    console.log("Encrypted Private Key: ", encryptedPK);
    console.log("Encrypted Public Key: ", publicKey);
    console.groupEnd();

    const tx = await contractWithSigner.setWalletInfo(
      keccak256(vaultId),
      keccak256(this.appId),
      encryptedPKBytes
    );
    await tx.wait();
    return encryptedPK;
  }

  async getPK(vaultId: string, message: string) {
    console.log("getPK");
    const signer = this.externalProvider;

    const contractWithSigner = this.contract.connect(signer);
    const encryptedPKBytes = await contractWithSigner.getWalletInfo(
      keccak256(vaultId),
      keccak256(this.appId)
    );

    const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);

    console.group("Encrypted Wallet Info");
    console.log("Encrypted Private Key: ", encryptedPKJson);
    console.groupEnd();

    return this.decrypt(JSON.parse(encryptedPKJson), message);
  }

  async encrypt(
    privateKey:
      | ethers.utils.BytesLike
      | ExternallyOwnedAccount
      | ethers.utils.SigningKey,
    password: string | ethers.utils.Bytes
  ) {
    console.log("encrypt");
    const wallet = new ethers.Wallet(privateKey);
    console.log("wallet", wallet);
    return wallet.encrypt(password);
  }

  async decrypt(encryptedWallet: string, message: string | ethers.utils.Bytes) {
    return ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, message);
  }
}

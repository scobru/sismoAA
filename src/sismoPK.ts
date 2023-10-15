import { Contract, Signer, ethers, providers } from "ethers";
import dotenv from "dotenv";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { keccak256 } from "ethers/lib/utils.js";

dotenv.config();

import SismoEncryptedABI from "../artifacts/contracts/SismoEncrypted.sol/SismoEncrypted.json";

const contractAddress = "0x350Cf3e534bDF467b22CC5E3AABd737A43DbB208"; // goerliBase

export default class SismoPK {
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
      SismoEncryptedABI.abi,
      this.externalProvider
    );
    this.appId = appId;
  }

  async createPK(vaultId: any, password: string) {
    const signer = this.externalProvider;
    const contractWithSigner = this.contract.connect(signer);
    const wallet = ethers.Wallet.createRandom();

    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;

    const encryptedPK = await this.encrypt(privateKey, password, vaultId);
    const encryptedPKJson = JSON.stringify(encryptedPK);
    const encryptedPKBytes = ethers.utils.toUtf8Bytes(encryptedPKJson);

    const tx = await contractWithSigner.setWalletInfo(
      keccak256(vaultId),
      keccak256(this.appId),
      encryptedPKBytes
    );
    await tx.wait();

    return encryptedPK;
  }

  async getPK(vaultId: string, message: string) {
    const signer = this.externalProvider;

    const contractWithSigner = this.contract.connect(signer);
    const encryptedPKBytes = await contractWithSigner.getWalletInfo(
      keccak256(vaultId),
      keccak256(this.appId)
    );

    const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);

    return this.decrypt(JSON.parse(encryptedPKJson), message);
  }

  async encrypt(
    privateKey:
      | ethers.utils.BytesLike
      | ExternallyOwnedAccount
      | ethers.utils.SigningKey,
    password: string | ethers.utils.Bytes,
    vaultId?: string
  ) {
    const wallet = new ethers.Wallet(privateKey);
    const message = ethers.utils.defaultAbiCoder.encode(
      ["string", "string"],
      [password, vaultId]
    );
    return wallet.encrypt(message);
  }

  async decrypt(encryptedWallet: string, message: string | ethers.utils.Bytes) {
    return ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, message);
  }
}

import { Contract, Signer, ethers, providers } from "ethers";
import dotenv from "dotenv";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { keccak256 } from "ethers/lib/utils.js";

dotenv.config();

const contractAddress = "0x44ea1dC829499142831534A11C6a9eC2c496d19C"; // goerliBase

const contractABI: any[] = [
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
      contractABI,
      this.externalProvider
    );
    this.appId = appId;
  }

  async createPKP(vaultId: any, password: string) {
    const signer = this.externalProvider;
    console.log("signer", signer);

    const contractWithSigner = this.contract.connect(signer);
    console.log("contractWithSigner", contractWithSigner);

    const wallet = ethers.Wallet.createRandom();
    console.log("wallet.address", wallet.address);

    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;
    console.log("publicKey", publicKey);

    const encryptedPK = await this.encrypt(privateKey, password, vaultId);
    console.log("encryptedPK", encryptedPK);

    console.log("keccak256(vaultId)", keccak256(vaultId));

    const encryptedPKJson = JSON.stringify(encryptedPK);
    console.log("Encrypted PK JSON:", encryptedPKJson);

    const encryptedPKBytes = ethers.utils.toUtf8Bytes(encryptedPKJson);
    console.log("Encrypted PK Bytes:", encryptedPKBytes);

    const tx = await contractWithSigner.setWalletInfo(
      keccak256(vaultId),
      keccak256(this.appId),
      encryptedPKBytes
    );
    await tx.wait();

    console.log("Transaction mined!", tx.hash);

    return encryptedPK;
  }

  async getPKP(vaultId: string, message: string) {
    const signer = this.externalProvider;

    const contractWithSigner = this.contract.connect(signer);
    const encryptedPKBytes = await contractWithSigner.getWalletInfo(
      keccak256(vaultId),
      keccak256(this.appId)
    );

    console.log("Retrieved Encrypted PK Bytes:", encryptedPKBytes);

    const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);
    console.log("Retrieved Encrypted PK JSON:", encryptedPKJson);

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

export default SismoPKP;

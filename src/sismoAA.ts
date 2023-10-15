import SismoAAABI from "../artifacts/contracts/SismoAA.sol/SismoAA.json";
import SismoAAFactoryABI from "../artifacts/contracts/SismoAAFactory.sol/SismoAAFactory.json";
import { Contract, Signer, ethers, providers } from "ethers";
import {
  AuthType,
  SignatureRequest,
  AuthRequest,
  SismoConnectConfig,
} from "@sismo-core/sismo-connect-client";

export type TXCALL = {
  to: string;
  value: string;
  data: string;
};

const factoryAddress = "0xFAb59D31B6fAEe4b29BdDD997b56607aFe66FF4B"; // goerliBase

// Encryption and Decryption functions remain the same

export class SismoAA {
  private contractAddress: string;
  private externalProvider: providers.JsonRpcProvider | Signer;
  private contractFactory: Contract;
  private appId: string;

  constructor(
    externalProvider: providers.JsonRpcProvider | Signer,
    appId: string
  ) {
    this.contractAddress = factoryAddress;
    this.externalProvider = externalProvider;
    this.contractFactory = new Contract(
      this.contractAddress,
      SismoAAFactoryABI.abi, // Replace with the actual ABI
      this.externalProvider
    );
    this.appId = appId;
  }

  async prepareSismoConnect(to: string, value: string, data: string) {
    const CONFIG: SismoConnectConfig = {
      appId: this.appId,
    };

    const AUTHS: AuthRequest[] = [{ authType: AuthType.VAULT }];

    const SIGNATURE_REQUEST: SignatureRequest = {
      message: ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [to, value, data]
      ),
    };

    return {
      CONFIG,
      AUTHS,
      SIGNATURE_REQUEST,
    };
  }

  async createAA(vaultId: string) {
    try {
      const signer = this.externalProvider as Signer;
      const contractWithSigner = this.contractFactory.connect(signer);

      const tx = await contractWithSigner.createAA(
        ethers.utils.keccak256(vaultId)
      );
      await tx.wait();

      const fetchAA = await contractWithSigner.getAAForVaultId(
        ethers.utils.keccak256(vaultId)
      );

      return fetchAA;
    } catch (error) {
      console.error("Error in createPKP:", error);
    }
  }

  async getAA(vaultId: string) {
    try {
      const signer = this.externalProvider as Signer;
      const contractWithSigner = this.contractFactory.connect(signer);

      const fetchAA = await contractWithSigner.getAAForVaultId(
        ethers.utils.keccak256(vaultId)
      );

      return fetchAA;
    } catch (error) {
      console.error("Error in getPKP:", error);
    }
  }

  async execute(sismoConnectRespnse: string, vaultId: string, txCall: any) {
    try {
      const nonce = ethers.utils.randomBytes(32);

      const AAaddress: string = await this.getAA(vaultId);
      const contractAA = new Contract(
        AAaddress,
        SismoAAABI.abi,
        this.externalProvider
      );

      const signer = this.externalProvider as Signer;
      const contractWithSigner = contractAA.connect(signer);

      const result = await contractWithSigner.executeTransaction(
        sismoConnectRespnse,
        txCall.to,
        txCall.value,
        txCall.data,
        this.appId,
        nonce
      );

      if (result) {
        console.log("Tx Success");
      } else {
        console.log("Tx Failed");
      }
    } catch (error) {
      console.error("Error in execute:", error);
    }
  }
}

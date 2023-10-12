import { Contract, Signer, ethers, providers } from "ethers";
import dotenv from "dotenv";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
import { keccak256 } from "ethers/lib/utils.js";
import SismoABI from "../artifacts/contracts/SismoPKP.sol/SismoPKP.json";
import {
  AuthType,
  SignatureRequest,
  AuthRequest,
  SismoConnectConfig,
} from "@sismo-core/sismo-connect-client";

dotenv.config();

let mk: string;

const contractAddress = "0x24E7646620b95994f05A9fCbdA361b88a2591eB8"; // goerliBase

/**
 * SismoPKP class.
 * @class
 * @classdesc This class provides the methods to interact with SismoPKP smart contract.
 */
class SismoPKP {
  private contractAddress: string;
  private externalProvider: providers.JsonRpcProvider | Signer;
  private contract: Contract;
  private appId: string;

  /**
   * Initialize the class with external provider and application ID.
   * @param {providers.JsonRpcProvider} externalProvider - The external Ethereum provider.
   * @param {string} appId - The application ID.
   */
  constructor(externalProvider: providers.JsonRpcProvider, appId: string) {
    this.contractAddress = contractAddress;
    this.externalProvider = externalProvider;
    this.contract = new Contract(
      this.contractAddress,
      SismoABI.abi,
      this.externalProvider
    );
    this.appId = appId;
  }

  /**
   * Recover PassKey from the smart contract and compare it with master key.
   * @param {string} sismoConnectResponse - The response from Sismo Connect.
   * @return {string | undefined} The pass key if it matches with master key.
   */
  async recoverPKP(sismoConnectResponse: string) {
    const signer = this.externalProvider;
    const contractWithSigner = this.contract.connect(signer);
    const passKey = await contractWithSigner.getPassKey(
      sismoConnectResponse,
      this.appId
    );
    if (passKey != mk) {
      console.log("⚠️ passKey != mk");
      return;
    } else {
      console.log("💫 passKey == mk");
    }
    return passKey;
  }

  /**
   * Recover the encrypted Private Key Pair (PKP) using a master key.
   * @param {string} masterKey - The master key for decryption.
   * @return {Promise<string>} The decrypted PKP.
   */
  async recoverPKPMasterKey(masterKey: string) {
    const signer = this.externalProvider;
    const contractWithSigner = this.contract.connect(signer);
    const encryptedPKBytes = await contractWithSigner.getWalletInfo(
      masterKey,
      this.appId
    );
    const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);
    return this.decrypt(JSON.parse(encryptedPKJson), masterKey);
  }

  /**
   * Get the encrypted Private Key Pair (PKP) from the smart contract.
   * @param {string} vaultId - The vault ID.
   * @param {string} twitterId - The Twitter ID.
   * @param {string} guardianAddress - The guardian Ethereum address.
   * @return {Promise<string>} The decrypted PKP.
   */
  async getPKP(vaultId: string, twitterId: string, guardianAddress: string) {
    const signer = this.externalProvider;

    const masterKey = keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "bytes32"],
        [
          keccak256(
            ethers.utils.defaultAbiCoder.encode(["uint256"], [vaultId])
          ),
          keccak256(
            ethers.utils.defaultAbiCoder.encode(["uint256"], [twitterId])
          ),
          keccak256(
            ethers.utils.defaultAbiCoder.encode(["address"], [guardianAddress])
          ),
        ]
      )
    );

    mk = masterKey;

    const contractWithSigner = this.contract.connect(signer);
    const encryptedPKBytes = await contractWithSigner.getWalletInfo(
      keccak256(vaultId),
      this.appId
    );
    const encryptedPKJson = ethers.utils.toUtf8String(encryptedPKBytes);

    return this.decrypt(JSON.parse(encryptedPKJson), masterKey);
  }

  /**
   * Encrypt the given private key with a password.
   * @param {string | ExternallyOwnedAccount | ethers.utils.SigningKey} privateKey - The private key to be encrypted.
   * @param {string | ethers.utils.Bytes} password - The password for encryption.
   * @return {Promise<string>} The encrypted private key.
   */
  async encrypt(
    privateKey:
      | ethers.utils.BytesLike
      | ExternallyOwnedAccount
      | ethers.utils.SigningKey,
    password: string | ethers.utils.Bytes
  ) {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.encrypt(password);
  }

  /**
   * Decrypt the encrypted wallet JSON using a password.
   * @param {string} encryptedWallet - The encrypted wallet JSON string.
   * @param {string | ethers.utils.Bytes} password - The password for decryption.
   * @return {Promise<string>} The decrypted private key.
   */
  async decrypt(
    encryptedWallet: string,
    password: string | ethers.utils.Bytes
  ) {
    return ethers.Wallet.fromEncryptedJsonSync(encryptedWallet, password);
  }

  /**
   * Create a new Private Key Pair (PKP) and store it in the smart contract.
   * @param {string} vaultId - The vault ID.
   * @param {string} twitterId - The Twitter ID.
   * @param {string} appId - The application ID.
   * @param {string} guardianAddress - The guardian Ethereum address.
   * @return {Promise<string>} The encrypted PKP.
   */
  async createPKP(
    vaultId: string,
    twitterId: string,
    appId: string,
    guardianAddress: string
  ) {
    console.log("Creating PKP...");

    const wallet = ethers.Wallet.createRandom();

    const privateKey = wallet.privateKey;
    const publicKey = wallet.publicKey;

    console.log("privateKey", privateKey);
    console.log("publicKey", publicKey);

    const masterKey = keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "bytes32", "bytes32"],
        [
          keccak256(
            ethers.utils.defaultAbiCoder.encode(["uint256"], [vaultId])
          ),
          keccak256(
            ethers.utils.defaultAbiCoder.encode(["uint256"], [twitterId])
          ),
          keccak256(
            ethers.utils.defaultAbiCoder.encode(["address"], [guardianAddress])
          ),
        ]
      )
    );

    mk = masterKey;

    console.log("masterKey", masterKey);

    const encryptedPK = await this.encrypt(privateKey, masterKey);
    const encryptedPKJson = JSON.stringify(encryptedPK);
    const encryptedPKBytes = ethers.utils.toUtf8Bytes(encryptedPKJson);

    const signer = this.externalProvider;
    const contractWithSigner = this.contract.connect(signer);

    const tx = await contractWithSigner.setWalletInfo(
      keccak256(vaultId),
      appId,
      encryptedPKBytes
    );
    await tx.wait();

    console.log("PKP created!");

    return encryptedPK;
  }

  /**
   * Prepare the configuration for Sismo Connect.
   * @param {string} _appId - The application ID.
   * @param {string} withdrawAddress - The Ethereum address for withdrawal.
   * @return {Promise<object>} The Sismo Connect configuration.
   */
  async prepareSismoConnect(_appId: string, withdrawAddress: string) {
    const CONFIG: SismoConnectConfig = {
      appId: _appId,
    };

    const AUTHS: AuthRequest[] = [
      { authType: AuthType.VAULT },
      { authType: AuthType.TWITTER },
    ];

    const SIGNATURE_REQUEST: SignatureRequest = {
      message: String(await this.signMessage(withdrawAddress)),
    };

    return {
      CONFIG,
      AUTHS,
      SIGNATURE_REQUEST,
    };
  }

  /**
   * Sign a message using the Ethereum provider.
   * @param {string} withdrawAddress - The Ethereum address for withdrawal.
   * @return {Promise<string>} The signed message.
   */
  async signMessage(withdrawAddress: string) {
    return ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [String(withdrawAddress)]
    );
  }
}

export default SismoPKP;

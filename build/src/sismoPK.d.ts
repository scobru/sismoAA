import { Signer, ethers, providers } from "ethers";
import { ExternallyOwnedAccount } from "@ethersproject/abstract-signer";
export declare class SismoPK {
    private contractAddress;
    private externalProvider;
    private contract;
    private appId;
    constructor(externalProvider: providers.JsonRpcProvider | Signer, appId: string);
    createPK(vaultId: any, password: string): Promise<string>;
    getPK(vaultId: string, message: string): Promise<ethers.Wallet>;
    encrypt(privateKey: ethers.utils.BytesLike | ExternallyOwnedAccount | ethers.utils.SigningKey, password: string | ethers.utils.Bytes): Promise<string>;
    decrypt(encryptedWallet: string, message: string | ethers.utils.Bytes): Promise<ethers.Wallet>;
}

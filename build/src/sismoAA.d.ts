import { Signer, providers } from "ethers";
import { SignatureRequest, AuthRequest, SismoConnectConfig } from "@sismo-core/sismo-connect-client";
export type TXCALL = {
    to: string;
    value: string;
    data: string;
};
export declare class SismoAA {
    private contractAddress;
    private externalProvider;
    private contractFactory;
    private appId;
    constructor(externalProvider: providers.JsonRpcProvider | Signer, appId: string);
    prepareSismoConnect(to: string, value: string, data: string): Promise<{
        CONFIG: SismoConnectConfig;
        AUTHS: AuthRequest[];
        SIGNATURE_REQUEST: SignatureRequest;
    }>;
    createAA(vaultId: string): Promise<any>;
    getAA(vaultId: string): Promise<any>;
    execute(sismoConnectRespnse: string, vaultId: string, txCall: any): Promise<void>;
}

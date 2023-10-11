
# SismoPKP

## Description

This SDK allows developers to create EVM addresses for all users of their app through the vaultId. It also allows the generation and retrieval of passkeys for added security.

## Installation

```bash
npm install sismoPKP
```

## Usage

```javascript
import { JsonRpcProvider } from "ethers/providers";
import SismoPKP from "@scobru/sismopkp";

const provider = new JsonRpcProvider("URL_DEL_PROVIDER");
const sismoPKP = new SismoPKP(provider, "yourAppId");
```

### Prepare Sismo Connect and Generate OTP

```javascript
const { CONFIG, AUTHS, SIGNATURE_REQUEST, OTP } = await sismoPKP.prepareSismoConnect("yourAppId");
```

### Create new address with PassKey

```javascript
const createPKP = await sismoPKP.createPKP("sismoConnectResponse", "yourVaultId", "yourAppId", OTP);
```

### Get stored address from vaultId

```javascript
const decryptedPK = await sismoPKP.getPKP("sismoConnectResponse", "yourVaultId", "yourAppId", OTP);
```

### Create PassKey

```javascript
const createPassKey = await sismoPKP.createPassKey("sismoConnectResponse", "yourAppId", OTP);
```

### Get PassKey

```javascript
const getPassKey = await sismoPKP.getPassKey("sismoConnectResponse", "yourAppId", OTP);
```

## API

### `prepareSismoConnect(_appId: string): Promise<any>`

Prepares Sismo Connect and generates an OTP for use in other functions.

#### Parameters

- `_appId: string` - Your application ID.

#### Returns

- `Promise<any>` - A promise that resolves to an object containing the configuration, auth requests, signature request, and OTP.

### `createPKP(sismoConnectResponse: string, vaultId: string, appId: string, otp: string): Promise<any>`

Creates a new private key, encrypts it using a passkey, and stores it in the Ethereum smart contract. Returns the encrypted private key.

#### Parameters

- `sismoConnectResponse: string` - The Sismo Connect Response.
- `vaultId: string` - The vaultId, to encrypt the PK.
- `appId: string` - Your application ID.
- `otp: string` - One-time password.

#### Returns

- `Promise<any>` - A promise that resolves to the encrypted private key.

### `getPKP(sismoConnectResponse: string, vaultId: string, appId: string, otp: string): Promise<any>`

Retrieves an encrypted private key from the specified hash(vaultID) in the Ethereum smart contract and decrypts it using the passkey.

#### Parameters

- `sismoConnectResponse: string` - The Sismo Connect Response.
- `vaultId: string` - The vaultId, to decrypt the PK.
- `appId: string` - Your application ID.
- `otp: string` - One-time password.

#### Returns

- `Promise<any>` - A promise that resolves to the decrypted private key.

## Links

<https://sismo.io/>

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

# SismoPKP

## Description

This library allows developers to create EVM addresses for all users of their app through the vaultId.

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

### Create new address

```javascript
const createPKP = await sismoPKP.createPKP("yourVaultId");
```

### Get stored address from vaultId

```javascript
const decryptedPK = await sismoPKP.getPKP("yourVaultId");
```

## API

### `createPKP(vaultId: any): Promise<any>`

Creates a new private key, encrypts it, and stores it in the Ethereum smart contract. Returns the encrypted private key.

#### Parameters

- `vaultId: any` - The vaultId, to encrypt the PK.

#### Returns

- `Promise<any>` - A promise that resolves to the encrypted private key..

---

### `getPKP(vaultId: any): Promise<any>`

Retrieves an encrypted private key from the specified hash(vaultID) in the Ethereum smart contract and decrypts it.

#### Parameters

- `vaultId: any` - The vaultId, to decrypt the PK.

#### Returns

- `Promise<any>` - Una promessa che si risolve con la chiave privata decifrata.

## Links

<https://sismo.io/>

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

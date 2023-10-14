
# SismoPKP

## Description

This SDK enables developers to generate EVM addresses for all users in their application through the vault ID. Additionally, it allows for the generation and retrieval of passkeys for enhanced security. The SDK also provides a set of methods for interacting with the SismoPKP smart contract.

## Installation

```bash
npm install sismoPKP
```

## Usage

```javascript
import { JsonRpcProvider } from "ethers/providers";
import SismoPKP from "@scobru/sismopkp";

const provider = new JsonRpcProvider("YOUR_PROVIDER_URL");
const sismoPKP = new SismoPKP(provider, "yourAppId");
```

### Prepare Sismo Connect and Generate OTP

```javascript
const { CONFIG, AUTHS, SIGNATURE_REQUEST } = await sismoPKP.prepareSismoConnect("guardianAddress");
```

### Create a New Address with PassKey

```javascript
const createPKP = await sismoPKP.createPKP("vaultId", "twitterId", "guardianAddress");
```

### Retrieve Stored Address from vaultId

```javascript
const decryptedPK = await sismoPKP.getPKP("vaultId", "twitterId", "guardianAddress");
```

## API

### Methods

#### `prepareSismoConnect(withdrawAddress: string): Promise<object>`

Prepares the necessary configurations for Sismo Connect.

- **Parameters**
  - `withdrawAddress: string`: The Ethereum address for withdrawal.
  
- **Returns**
  - `Promise<object>`: An object containing Sismo Connect configurations.

#### `createPKP(vaultId: string, twitterId: string, guardianAddress: string): Promise<string>`

Generates a new EVM address, encrypts the private key, and stores it in the smart contract.

- **Parameters**
  - `vaultId: string`: The vault ID.
  - `twitterId: string`: The Twitter ID.
  - `guardianAddress: string`: The guardian Ethereum address.
  
- **Returns**
  - `Promise<string>`: Encrypted Private Key Pair (PKP).

#### `getPKP(vaultId: string, twitterId: string, guardianAddress: string): Promise<string>`

Retrieves and decrypts an encrypted private key from a given vault ID.

- **Parameters**
  - `vaultId: string`: The vault ID.
  - `twitterId: string`: The Twitter ID.
  - `guardianAddress: string`: The guardian Ethereum address.
  
- **Returns**
  - `Promise<string>`: Decrypted Private Key Pair (PKP).

## Solidity Smart Contract

The SDK interacts with a Solidity smart contract deployed on the Ethereum blockchain. The contract serves as a secure storage and retrieval mechanism for wallet information and provides functionalities for generating and verifying passkeys.

### Contract Interface: `ISismoVerifier`

A separate verifier contract should implement this interface. This contract is responsible for the verification of Sismo Connect responses.

### Main Contract: `SismoPKP`

The main contract contains the following public functions:

#### `getPassKey(bytes memory sismoConnectResponse, bytes16 appId) returns (bytes32)`

This function takes a Sismo Connect response and an App ID as parameters and returns the master key, generated using the vault ID, Twitter ID, and guardian address.

#### `setWalletInfo(bytes32 encryptedVaultId, bytes16 appId, bytes memory walletInfo)`

This function allows you to set wallet information in the smart contract. It takes an encrypted vault ID, App ID, and the wallet information to be stored.

#### `getWalletInfo(bytes32 encryptedVaultId, bytes16 appId) returns (bytes memory)`

This function allows you to retrieve wallet information from the smart contract. It takes an encrypted vault ID and App ID as parameters and returns the stored wallet information.

## Links

<https://sismo.io/>

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

/* 
   _____   _____    _____   __  __    ____             _____    _  __  _____  
  / ____| |_   _|  / ____| |  \/  |  / __ \           |  __ \  | |/ / |  __ \ 
 | (___     | |   | (___   | \  / | | |  | |  ______  | |__) | | ' /  | |__) |
  \___ \    | |    \___ \  | |\/| | | |  | | |______| |  ___/  |  <   |  ___/ 
  ____) |  _| |_   ____) | | |  | | | |__| |          | |      | . \  | |     
 |_____/  |_____| |_____/  |_|  |_|  \____/           |_|      |_|\_\ |_|     

*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISismoVerifier {
    function sismoVerify(
        bytes memory sismoConnectResponse,
        bytes16 appId,
        bytes32 hash
    ) external view returns (bytes memory, bytes memory);
}

contract SismoPKP {
    mapping(bytes16 => mapping(bytes32 => bytes)) private vaults;
    mapping(bytes16 => mapping(bytes32 => bytes32)) private passKey;
    mapping(bytes32 => bool) private usedOTPs;

    bytes32[] public allVaultIds; // New array to keep track of all vault IDs

    address public verifierContract;

    uint private nonce;

    constructor(address _verifierContract) {
        verifierContract = _verifierContract;
        nonce++;
    }

    function _generateKey() internal returns (bytes32) {
        bytes32 key = keccak256(
            abi.encodePacked(
                block.timestamp,
                blockhash(block.number - 1),
                block.prevrandao,
                tx.gasprice,
                nonce,
            )
        );

        nonce++;

        // Return the key
        return key;
    }

    function createPassKey(
        bytes memory sismoConnectResponse,
        bytes16 appId,
        bytes32 onetimePass,
        uint256 timestamp // Added timestamp
    ) external {
        require(block.timestamp <= timestamp + 1 minutes, "Request timed out"); // Time-based check

        (bytes memory vaultId, bytes memory signedMessage) = _verify(
            sismoConnectResponse,
            appId,
            onetimePass
        );

        require(!usedOTPs[onetimePass], "OTP already used"); // OTP reuse check

        usedOTPs[onetimePass] = true;

        (bytes32 secretValue, bytes32 otp) = abi.decode(signedMessage, (bytes32, bytes32))

        bytes32 key1 = keccak256(vaultId, signedMessage, otp);
        bytes32 key2 = keccak256(secretValue, key1);
       

        bytes32 key = keccak256(
            abi.encodePacked(
                block.timestamp,
                blockhash(block.number - uint256(key1) % 1000),
                block.prevrandao(uint256(key2) % 1000),
                tx.gasprice,
                nonce,
            )
        );

        require(passKey[appId][keccak256(vaultId)] == "0x00", "PASSKEY_EXISTS");

        // encrypt the key with the vaultId
        bytes32 encryptedPassKey = keccak256(
            abi.encode(key1, key2, vaultId)
        );

        passKey[appId][keccak256(vaultId)] = encryptedPassKey;

        nonce++;
    }

    function getPassKey(
        bytes memory sismoConnectResponse,
        bytes16 appId,
        bytes32 onetimePass
    ) external view returns (bytes32) {
        require(!usedOTPs[onetimePass], "OTP already used"); // OTP reuse check

        (bytes memory vaultId, ) = _verify(
            sismoConnectResponse,
            appId,
            onetimePass
        );
        nonce++;

        return passKey[appId][keccak256(vaultId)];
    }

    function setWalletInfo(
        bytes32 encryptedVaultId,
        bytes16 appId,
        bytes memory walletInfo
    ) external {
        require(
            vaults[appId][encryptedVaultId].length == 0,
            "Wallet info already exists"
        );
        vaults[appId][encryptedVaultId] = walletInfo;

        allVaultIds.push(encryptedVaultId); // Add to list of all vault IDs
        nonce++;
    }

    function getWalletInfo(
        bytes32 encryptedVaultId,
        bytes16 appId
    ) external view returns (bytes memory) {
        return vaults[appId][encryptedVaultId];
    }

    function _verify(
        bytes memory sismoConnectResponse,
        bytes16 appId,
        bytes32 onetimePass
    ) internal view returns (bytes memory, bytes memory) {
        (bytes memory vaultId, bytes memory signedMessage) = ISismoVerifier(
            verifierContract
        ).sismoVerify(sismoConnectResponse, appId, onetimePass);

        bytes32 _onetimePass = abi.decode(signedMessage, (bytes32));

        require(_onetimePass == onetimePass, "WRONG_ONETIMEPASS");

        nonce++;

        return (vaultId, signedMessage);
    }
}

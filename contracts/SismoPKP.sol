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

    bytes32[] public allVaultIds; // New array to keep track of all vault IDs

    address public verifierContract;

    constructor(address _verifierContract) {
        verifierContract = _verifierContract;
    }

    function createPassKey(
        bytes memory sismoConnectResponse,
        bytes16 appId,
        bytes32 onetimePass // pass in the signature
    ) external {
        (bytes memory vaultId, bytes memory signedMessage) = _verify(
            sismoConnectResponse,
            appId,
            onetimePass
        );

        // random number 1 to 100
        uint256 rand = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
        ) % 100000;

        // create random 32 hash for passkey
        bytes32 key = keccak256(
            abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                rand,
                signedMessage,
                vaultId
            )
        );

        passKey[appId][keccak256(vaultId)] = key;
    }

    function getPassKey(
        bytes memory sismoConnectResponse,
        bytes16 appId,
        bytes32 onetimePass
    ) external view returns (bytes32) {
        (bytes memory vaultId, ) = _verify(
            sismoConnectResponse,
            appId,
            onetimePass
        );

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

        return (vaultId, signedMessage);
    }
}

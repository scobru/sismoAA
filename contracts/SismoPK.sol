// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SismoEncrypted {
    mapping(bytes32 => mapping(bytes32 => bytes)) private vaults;
    bytes32[] public allVaultIds;

    function setWalletInfo(
        bytes32 encryptedVaultId,
        bytes32 appId,
        bytes memory walletInfo
    ) public {
        require(
            vaults[appId][encryptedVaultId].length == 0,
            "Wallet info already exists"
        );
        vaults[appId][encryptedVaultId] = walletInfo;
        allVaultIds.push(encryptedVaultId);
    }

    function getWalletInfo(
        bytes32 encryptedVaultId,
        bytes32 appId
    ) public view returns (bytes memory) {
        return vaults[appId][encryptedVaultId];
    }
}

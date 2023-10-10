// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SismoPKP {
    address public owner;

    mapping(bytes32 => mapping(bytes32 => bytes)) private vaults;
    bytes32[] public allVaultIds; // New array to keep track of all vault IDs

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

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
        allVaultIds.push(encryptedVaultId); // Add to list of all vault IDs
    }

    function getWalletInfo(
        bytes32 encryptedVaultId,
        bytes32 appId
    ) public view returns (bytes memory) {
        return vaults[appId][encryptedVaultId];
    }
}

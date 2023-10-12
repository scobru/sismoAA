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
        address to
    ) external view returns (uint256, uint256, bytes memory);
}

contract SismoPKP {
    mapping(bytes16 => mapping(bytes32 => bytes)) private vaults;

    address public verifierContract;

    constructor(address _verifierContract) {
        verifierContract = _verifierContract;
    }

    function getPassKey(
        bytes memory sismoConnectResponse,
        bytes16 appId
    ) external view returns (bytes32) {
        (
            uint256 vaultId,
            uint256 twitterId,
            bytes memory signedMessage
        ) = ISismoVerifier(verifierContract).sismoVerify(
                sismoConnectResponse,
                appId,
                address(msg.sender)
            );

        address _guardian = abi.decode(signedMessage, (address));
        require(msg.sender == _guardian, "WRONG_GUARDIAN"); // Guardian check

        // ABI encode the four hashed fields together and then hash to create the master key
        bytes32 masterKey = keccak256(
            abi.encode(
                keccak256(abi.encode(vaultId)),
                keccak256(abi.encode(twitterId)),
                keccak256(abi.encode(_guardian))
            )
        );

        return masterKey;
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
    }

    function getWalletInfo(
        bytes32 encryptedVaultId,
        bytes16 appId
    ) external view returns (bytes memory) {
        return vaults[appId][encryptedVaultId];
    }
}

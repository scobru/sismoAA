// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISismoVerifier {
    function sismoVerify(
        bytes memory sismoConnectResponse,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes16 _appId
    ) external view returns (uint256);
}

contract SismoAA {
    bytes32 public owner;
    address public verifierContract;
    mapping(bytes32 => bool) public nonce;

    constructor(bytes32 _owner, address _verifierContract) {
        owner = _owner;
        verifierContract = _verifierContract;
    }

    struct TxCall {
        address to;
        uint256 value;
        bytes data;
    }

    function executeTransaction(
        bytes memory sismoConnectResponse,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes16 _appId,
        bytes32 _nonce
    ) public returns (bool) {
        uint256 vaultId = ISismoVerifier(verifierContract).sismoVerify(
            sismoConnectResponse,
            _to,
            _value,
            _data,
            _appId
        );

        require(vaultId != 0, "Invalid vaultId");
        require(!nonce[_nonce], "Nonce already used");

        nonce[_nonce] = true;
        bytes memory vaultIdBytes = abi.encodePacked(vaultId);

        require(keccak256(vaultIdBytes) == owner, "Not the owner");

        (bool success, ) = _to.call{value: _value}(_data);
        require(success, "Transaction failed");

        return true;
    }

    function testSismoVerify(
        bytes memory sismoConnectResponse,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes16 _appId
    ) public view returns (uint256) {
        uint256 vaultId = ISismoVerifier(verifierContract).sismoVerify(
            sismoConnectResponse,
            _to,
            _value,
            _data,
            _appId
        );

        return vaultId;
    }

    receive() external payable {}
}

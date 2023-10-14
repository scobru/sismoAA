// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./SismoAA.sol";

contract SismoAAFactory {
    address public verifierContract;
    address[] public deployedAA;

    constructor(address _verifierContract) {
        verifierContract = _verifierContract;
    }

    mapping(bytes32 => address) public accounts;

    function createAA(bytes32 _owner) public returns (address) {
        address newAA = address(new SismoAA(_owner, verifierContract));
        deployedAA.push(newAA);
        accounts[_owner] = newAA;

        return newAA;
    }

    function getDeployedAA() public view returns (address[] memory) {
        return deployedAA;
    }

    function getAAForVaultId(bytes32 _owner) external view returns (address) {
        return accounts[_owner];
    }
}

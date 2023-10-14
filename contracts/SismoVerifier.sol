/**
 * @title MecenateVerifier
 * @dev Contract that verifies user identity using SismoConnect and returns user's vaultId, twitterId and telegramId.
 */
pragma solidity ^0.8.17;
import "./helpers/SismoConnectLib.sol";

contract SismoVerifier is SismoConnect {
    function sismoVerify(
        bytes memory sismoConnectResponse,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes16 _appId
    ) external view returns (uint256) {
        require(sismoConnectResponse.length > 0, "empty response");
        // Build authorization requests
        AuthRequest[] memory auths = new AuthRequest[](1);
        auths[0] = buildAuth(AuthType.VAULT);

        // Verify the response
        SismoConnectVerifiedResult memory result = verify({
            appId: _appId,
            responseBytes: sismoConnectResponse,
            auths: auths,
            signature: buildSignature(abi.encodePacked(_to, _value, _data))
        });

        // Store the verified auths
        VerifiedAuth[] memory _verifiedAuths = new VerifiedAuth[](
            result.auths.length
        );

        for (uint256 i = 0; i < result.auths.length; i++) {
            _verifiedAuths[i] = result.auths[i];
        }
        // Get the vaultId of the user
        // --> vaultId = hash(userVaultSecret, appId)
        uint256 vaultId = SismoConnectHelper.getUserId(result, AuthType.VAULT);

        bytes memory signedMessage = SismoConnectHelper.getSignedMessage(
            result
        );

        //decode signedMessage
        (address to, uint256 value, bytes memory data) = abi.decode(
            signedMessage,
            (address, uint256, bytes)
        );

        require(to == _to, "Invalid to address");
        require(value == _value, "Invalid value");
        require(keccak256(data) == keccak256(_data), "Invalid data");

        return vaultId;
    }
}

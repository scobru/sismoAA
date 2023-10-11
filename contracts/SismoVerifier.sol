/**
 * @title MecenateVerifier
 * @dev Contract that verifies user identity using SismoConnect and returns user's vaultId, twitterId and telegramId.
 */
pragma solidity ^0.8.17;
import "./helpers/SismoConnectLib.sol";

contract SismoVerifier is SismoConnect {
    function sismoVerify(
        bytes memory sismoConnectResponse,
        bytes16 _appId,
        bytes32 _hash
    ) external view returns (bytes memory, bytes memory) {
        require(sismoConnectResponse.length > 0, "empty response");

        // Build authorization requests
        AuthRequest[] memory auths = new AuthRequest[](1);

        auths[0] = buildAuth(AuthType.VAULT);

        // Verify the response
        SismoConnectVerifiedResult memory result = verify({
            appId: _appId,
            responseBytes: sismoConnectResponse,
            auths: auths,
            signature: buildSignature({message: abi.encode(_hash)})
        });

        bytes memory signedMessage = SismoConnectHelper.getSignedMessage(
            result
        );

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

        // Convert the vaultId to bytes
        bytes memory vaultIdBytes = abi.encodePacked(vaultId);

        return (vaultIdBytes, signedMessage);
    }
}

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
        address _to
    ) external view returns (uint256, uint256, bytes memory) {
        require(sismoConnectResponse.length > 0, "empty response");

        // Build authorization requests
        AuthRequest[] memory auths = new AuthRequest[](2);

        auths[0] = buildAuth(AuthType.VAULT);
        auths[1] = buildAuth(AuthType.TWITTER);

        // Verify the response
        SismoConnectVerifiedResult memory result = verify({
            appId: _appId,
            responseBytes: sismoConnectResponse,
            auths: auths,
            signature: buildSignature({message: abi.encode(_to)})
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

        uint256 twitterId = SismoConnectHelper.getUserId(
            result,
            AuthType.TWITTER
        );

        return (vaultId, twitterId, signedMessage);
    }
}

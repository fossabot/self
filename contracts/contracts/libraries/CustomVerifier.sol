// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {CircuitAttributeHandlerV2} from "./CircuitAttributeHandlerV2.sol";
import {AttestationId} from "../constants/AttestationId.sol";

struct PassportOutput {
  uint256[3] revealedDataPacked;
  uint256[4] forbiddenCountriesListPacked;
  uint256 nullifier;
}

struct IdCardOutput {
  uint256[4] revealedDataPacked;
  uint256[4] forbiddenCountriesListPacked;
  uint256 nullifier;
}

library CustomVerifier {
  error INVALID_ATTESTATION_ID();
  error INVALID_OFAC();
  error INVALID_FORBIDDEN_COUNTRIES();
  error INVALID_OLDER_THAN();

  /**
   * @dev Unpacks the configuration of the custom verifier.
   * @param config The configuration of the custom verifier.
   * @return attestationId The attestation id.
   * @return verificationConfig The verification configuration.
   */
  function unpackConfig(bytes calldata config) internal pure returns (uint8 attestationId, bytes memory verificationConfig) {
    assembly {
      let scratch := mload(0x40)

      calldatacopy(scratch, config.offset, 32)
      attestationId := byte(0, mload(scratch))
    }

    for (uint i = 1; i < config.length; i++) {
      verificationConfig = bytes.concat(verificationConfig, config[i]);
    }
  }

  /**
   * @dev Verifies the configuration of the custom verifier.
   * @param config The configuration of the custom verifier.
   * @param proofOutput The proof output of the custom verifier.
   */
  function customVerify(bytes calldata config, bytes calldata proofOutput) external pure {
    (uint8 attestationId, bytes memory verificationConfigBytes) = unpackConfig(config);

    VerificationConfig.GenericVerficationConfigV2 memory verificationConfig;

    verificationConfig = VerificationConfig.verificationConfigFromBytes(verificationConfigBytes);

    if (attestationId == 0) {
      revert INVALID_ATTESTATION_ID();
    }

    if (attestationId == AttestationId.E_PASSPORT) {
      PassportOutput memory passportOutput = abi.decode(proofOutput, (PassportOutput));
      return CustomVerifier.verifyPassport(verificationConfig, passportOutput);
    } else if (attestationId == AttestationId.EU_ID_CARD) {
      IdCardOutput memory idCardOutput = abi.decode(proofOutput, (IdCardOutput));
      return CustomVerifier.verifyIdCard(verificationConfig, idCardOutput);
    } else {
      revert INVALID_ATTESTATION_ID();
    }
  }

  function verifyPassport(VerificationConfig.GenericVerficationConfigV2 memory verificationConfig, PassportOutput memory passportOutput) internal pure {
    if (
      verificationConfig.ofacEnabled[0] ||
      verificationConfig.ofacEnabled[1] ||
      verificationConfig.ofacEnabled[2]
    ) {
      if (!CircuitAttributeHandlerV2.compareOfac(
        AttestationId.E_PASSPORT,
        passportOutput.revealedDataPacked,
        verificationConfig.ofacEnabled[0],
        verificationConfig.ofacEnabled[1],
        verificationConfig.ofacEnabled[2]
      )) {
        revert INVALID_OFAC();
      }
    }
    if (verificationConfig.forbiddenCountriesEnabled) {
      for (uint256 i = 0; i < 4; i++) {
        if (passportOutput.forbiddenCountriesListPacked[i] != verificationConfig.forbiddenCountriesListPacked[i]) {
          revert INVALID_FORBIDDEN_COUNTRIES();
        }
      }
    }

    if (verificationConfig.olderThanEnabled) {
      if (!CircuitAttributeHandlerV2.compareOlderThan(
        AttestationId.E_PASSPORT,
        passportOutput.revealedDataPacked,
        verificationConfig.olderThan
      )) {
        revert INVALID_OLDER_THAN();
      }
    }
  }

  function verifyIdCard(VerificationConfig.GenericVerficationConfigV2 memory verificationConfig, IdCardOutput memory idCardOutput) internal pure {
    if (verificationConfig.ofacEnabled[0] || verificationConfig.ofacEnabled[1]) {
      if (!CircuitAttributeHandlerV2.compareOfac(
        AttestationId.EU_ID_CARD,
        idCardOutput.revealedDataPacked,
        false,
        verificationConfig.ofacEnabled[0],
        verificationConfig.ofacEnabled[1]
      )) {
        revert INVALID_OFAC();
      }
    }

    if (verificationConfig.forbiddenCountriesEnabled) {
      for (uint256 i = 0; i < 4; i++) {
        if (idCardOutput.forbiddenCountriesListPacked[i] != verificationConfig.forbiddenCountriesListPacked[i]) {
          revert INVALID_FORBIDDEN_COUNTRIES();
        }
      }
    }

    if (verificationConfig.olderThanEnabled) {
      if (!CircuitAttributeHandlerV2.compareOlderThan(
        AttestationId.EU_ID_CARD,
        idCardOutput.revealedDataPacked,
        verificationConfig.olderThan
      )) {
        revert INVALID_OLDER_THAN();
      }
    }
  }
}

library VerificationConfig {
  struct GenericVerficationConfigV1 {
    bool olderThanEnabled;
    uint256 olderThan;
    bool forbiddenCountriesEnabled;
    uint256[4] forbiddenCountriesListPacked;
    bool[3] ofacEnabled;
  }

  struct GenericVerficationConfigV2 {
    bool olderThanEnabled;
    uint256 olderThan;
    bool forbiddenCountriesEnabled;
    uint256[4] forbiddenCountriesListPacked;
    bool[3] ofacEnabled;
  }

  function fromV1Config(VerificationConfig.GenericVerficationConfigV1 memory verificationConfigV1) internal pure returns (GenericVerficationConfigV2 memory verificationConfig) {
    verificationConfig = GenericVerficationConfigV2({
      olderThanEnabled: verificationConfigV1.olderThanEnabled,
      olderThan: verificationConfigV1.olderThan,
      forbiddenCountriesEnabled: verificationConfigV1.forbiddenCountriesEnabled,
      forbiddenCountriesListPacked: verificationConfigV1.forbiddenCountriesListPacked,
      ofacEnabled: verificationConfigV1.ofacEnabled
    });
  }

  // function fromV2Config(VerificationConfig.GenericVerficationConfigV2 memory verificationConfigV2) internal pure returns (GenericVerficationConfigV2 memory verificationConfig) {
  //   verificationConfig = verificationConfigV2;
  // }

  function verificationConfigFromBytes(bytes memory verificationConfig) internal pure returns (GenericVerficationConfigV2 memory verificationConfig) {
    verificationConfig = abi.decode(verificationConfig, (GenericVerficationConfigV2));
  }

  function v1ConfigIntoBytes(uint8 attestationId, GenericVerficationConfigV1 memory verificationConfig) internal pure returns (bytes memory v1ConfigBytes) {
    v1ConfigBytes = bytes.concat(attestationId, abi.encode(verificationConfig));
  }

  function v2ConfigIntoBytes(uint8 attestationId, GenericVerficationConfigV2 memory verificationConfig) internal pure returns (bytes memory v2ConfigBytes) {
    v2ConfigBytes = bytes.concat(attestationId, abi.encode(verificationConfig));
  }
}

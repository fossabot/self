// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {VerificationConfig} from "./CustomVerifier.sol";

struct GenericVerificationStruct {
  uint8 attestationId;
  bytes verificationConfig;
}

library GenericFormatter {
  function formatV1Config(uint8 attestationId, VerificationConfig.GenericVerficationConfigV1 memory verificationConfigV1) internal pure returns (bytes memory v1ConfigBytes) {
    VerificationConfig.GenericVerficationConfigV2 memory verificationConfigV2 = VerificationConfig.fromV1Config(verificationConfigV1);
    v1ConfigBytes = bytes.concat(attestationId, abi.encode(verificationConfigV2));
  }

  function formatV2Config(uint8 attestationId, VerificationConfig.GenericVerficationConfigV2 memory verificationConfig) internal pure returns (bytes memory v2ConfigBytes) {
    v2ConfigBytes = bytes.concat(attestationId, abi.encode(verificationConfig));
  }
}

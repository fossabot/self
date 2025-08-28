import { poseidon2, poseidon6 } from 'poseidon-lite';
import {
  generateCircuitInputsDSC,
  generateCircuitInputsRegister,
  generateCircuitInputsVCandDisclose,
} from '@selfxyz/common/utils/circuits/generateInputs';
import { genMockPassportData } from '@selfxyz/common/utils/passports/genMockPassportData';
import { getCircuitNameFromPassportData } from '@selfxyz/common/utils/circuitNames';

import { handshakeAndGetUuid, getProofGeneratedUpdate } from './helper.js';
import { VerificationConfig } from '@selfxyz/core';

import { LeanIMT } from '@openpassport/zk-kit-lean-imt';
import { SMT } from '@openpassport/zk-kit-smt';
// @ts-ignore
import passportNojson from '@selfxyz/circuits/tests/consts/ofac/passportNoAndNationalitySMT.json';
// @ts-ignore
import nameAndDobjson from '@selfxyz/circuits/tests/consts/ofac/nameAndDobSMT.json';
// @ts-ignore
import nameAndYobjson from '@selfxyz/circuits/tests/consts/ofac/nameAndYobSMT.json';
import { CircuitSignals, groth16 } from 'snarkjs';
// @ts-ignore
import { CircuitArtifacts } from '@selfxyz/contracts/test/utils/types.js';
import {  REGISTER_MEDIUM_URL, REGISTER_URL } from './constant.js';

export async function genAndRegisterMockPassport(hashFunction: string, sigAlg: string, domainParameter: string, keyLength: number) {

  const passportData = genMockPassportData(
    hashFunction,
    hashFunction,
    `${sigAlg}_${hashFunction}_${domainParameter}_${keyLength}` as any,
    "FRA",
    "000101",
    "300101",
  );

  const secret = "1234";

  const dscTree = await fetch("http://tree.staging.self.xyz/dsc");
  const serialized_dsc_tree: any = await dscTree.json();

  const registerInputs = generateCircuitInputsRegister(
    secret,
    passportData,
    serialized_dsc_tree.data as string
  );

  const registerCircuitName = getCircuitNameFromPassportData(
    passportData,
    "register"
  );

  const registerUuid = await handshakeAndGetUuid(
    keyLength === 384 ? REGISTER_MEDIUM_URL : REGISTER_URL,
    registerInputs,
    "register",
    registerCircuitName
  );
  const registerData = await getProofGeneratedUpdate(registerUuid);
  console.log("\x1b[34m%s\x1b[0m", "register uuid:", registerUuid);
  console.log("\x1b[34m%s\x1b[0m", "circuit:", registerCircuitName);
  console.log(
    "\x1b[34m%s\x1b[0m",
    "witness generation duration:",
    //@ts-ignore
    (new Date(registerData.witness_generated_at) -
      //@ts-ignore
      new Date(registerData.created_at)) /
      1000,
    " seconds"
  );
  console.log(
    "\x1b[34m%s\x1b[0m",
    "proof   generation duration:",
    //@ts-ignore
    (new Date(registerData.proof_generated_at) -
      //@ts-ignore
      new Date(registerData.witness_generated_at)) /
      1000,
    " seconds"
  );


}

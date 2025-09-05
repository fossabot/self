import { genAndInitMockPassportData, generateCircuitInputsRegister, getCircuitNameFromPassportData } from "@selfxyz/common";
import { getProofGeneratedUpdate, handshakeAndGetUuid, runGenerateVcAndDiscloseRawProof } from "./ts-api/utils/helper.js";
import { REGISTER_URL } from "./ts-api/utils/constant.js";
import axios from "axios";

async function registerMockPassport(secret) {

  const passportData = genAndInitMockPassportData(
    "sha1",
    "sha1",
    "rsa_sha1_65537_4096",
    "FRA",
    "000101",
    "300101",
  );

  const dscTree = await axios.get("http://tree.staging.self.xyz/dsc");
  const serialized_dsc_tree = dscTree.data;

  //Register proof generation
  const registerInputs = generateCircuitInputsRegister(
    secret,
    passportData,
    serialized_dsc_tree.data
  );

  const registerCircuitName = getCircuitNameFromPassportData(
    passportData,
    "register"
  );

  //keyLength === 384 ? REGISTER_MEDIUM_URL : REGISTER_URL,
  const registerUuid = await handshakeAndGetUuid(
    REGISTER_URL,
    registerInputs,
    "register",
    registerCircuitName
  );

  const registerData = await getProofGeneratedUpdate(registerUuid);
  console.log(" Got register proof generated update:", registerData ? "SUCCESS" : "FAILED");
  console.log("\x1b[34m%s\x1b[0m", "register uuid:", registerUuid);
  console.log("\x1b[34m%s\x1b[0m", "circuit:", registerCircuitName);
  console.log(
    "\x1b[34m%s\x1b[0m",
    "witness generation duration:",
    (new Date(registerData.witness_generated_at) -
      new Date(registerData.created_at)) /
      1000,
    " seconds"
  );
  console.log(
    "\x1b[34m%s\x1b[0m",
    "proof   generation duration:",
    (new Date(registerData.proof_generated_at) -
      new Date(registerData.witness_generated_at)) /
      1000,
    " seconds"
  );
  return passportData;
}


async function discloseProof(secret, attestationId, passportData, scope){

 return await runGenerateVcAndDiscloseRawProof(
    secret,
    attestationId,
    passportData,
    scope,
    "",
    );

}

export { registerMockPassport, discloseProof };

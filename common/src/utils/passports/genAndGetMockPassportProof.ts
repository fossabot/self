import { poseidon6 } from 'poseidon-lite';
import { getCircuitNameFromPassportData } from '../circuits/circuitsName.js';
import { generateCircuitInputsDSC, generateCircuitInputsRegister } from '../circuits/generateInputs.js';
import { SignatureAlgorithm } from '../types.js';
import { DSC_MEDIUM_URL, DSC_URL } from './constant.js';
import { genMockPassportData } from './genMockPassportData.js';
import { createRandomString, getProofGeneratedUpdate, handshakeAndGetUuid } from './utilis.js';

export async function genAndGetMockPassportProof(hashFunction: string, sigAlg: string, domainParameter: string, keyLength: number) {

  const response = await fetch("http://tree.staging.self.xyz/csca");
  const data = await response.json();

  const cscaTree = JSON.parse(data.data);

  const passportData =genMockPassportData(
    hashFunction,
    hashFunction,
    `${sigAlg}_${hashFunction}_${domainParameter}_${keyLength}` as SignatureAlgorithm,
    "FRA",
    "000101",
    "300101",
    undefined,
    createRandomString(6)
  );

  const dscInputs = generateCircuitInputsDSC(passportData, cscaTree!);
  const dscCircuitName = getCircuitNameFromPassportData(passportData, "dsc");
  const dscUuid = await handshakeAndGetUuid(
    keyLength === 384 ? DSC_MEDIUM_URL : DSC_URL,
    dscInputs,
    "dsc",
    dscCircuitName
  );

  const dscData = await getProofGeneratedUpdate(dscUuid);
  //pretty print the circuit name
  console.log("\x1b[34m%s\x1b[0m", "dsc uuid:", dscUuid);
  console.log("\x1b[34m%s\x1b[0m", "circuit:", dscCircuitName);
  console.log(
    "\x1b[34m%s\x1b[0m",
    "witness generation duration:",
    //@ts-ignore
    (new Date(dscData.witness_generated_at) - new Date(dscData.created_at)) /
      1000,
    " seconds"
  );
  console.log(
    "\x1b[34m%s\x1b[0m",
    "proof   generation duration:",
    //@ts-ignore
    (new Date(dscData.proof_generated_at) -
      //@ts-ignore
      new Date(dscData.witness_generated_at)) /
      1000,
    " seconds"
  );

  const secret = poseidon6(
    createRandomString(6)
      .split("")
      .map((x) => BigInt(x.charCodeAt(0)))
  ).toString();

  const dscTree = await fetch("http://tree.staging.self.xyz/dsc");
  const serialized_dsc_tree = await dscTree.json();

  const registerInputs = generateCircuitInputsRegister(
    secret,
    passportData,
    serialized_dsc_tree.data as string
  );
  



  return passportData;
}

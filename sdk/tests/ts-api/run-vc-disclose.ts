
import { hashEndpointWithScope } from "@selfxyz/common/utils/scope";
import { genAndInitMockPassportData } from "@selfxyz/common/utils/passports/genMockPassportData";
import { runGenerateVcAndDiscloseRawProof } from "./utils/helper.js";

async function main() {
  const secret = "1234";
  const attestationId = "1";
  const scope = hashEndpointWithScope("http://localhost:3000", "self-playground");

  const passportData = genAndInitMockPassportData(
    "sha256",
    "sha256",
    "rsa_sha256_65537_4096" as any,
    "FRA",
    "000101",
    "300101",
  );

  await runGenerateVcAndDiscloseRawProof(
    secret,
    attestationId,
    passportData,
    scope,
    "",
  );

  console.log("Saved proof JSON to vc_and_disclose_proof.json");
}

main().catch((err) => {
  console.error("Failed to generate VC+Disclose proof:", err?.message ?? err);
  process.exit(1);
});

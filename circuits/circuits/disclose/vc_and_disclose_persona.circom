pragma circom 2.1.9;

include "../utils/persona/constants.circom";
include "../utils/persona/disclose/disclose.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";
include "../utils/passport/signatureVerifier.circom";
include "../utils/passport/customHashers.circom";
include "@openpassport/zk-email-circuits/lib/sha.circom";
include "@openpassport/zk-email-circuits/lib/bigint.circom";

template VC_AND_DISCLOSE(
    MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH,
    n,
    k
) {
    var persona_length = PERSONA_MAX_LENGTH();
    var country_length = COUNTRY_LENGTH();
    var compressed_bit_len = 121;

    signal input PersonaID_data_padded[PERSONA_DATA_PADDED()];
    signal input compressed_disclose_sel[2];

    signal input pubKey[k];
    signal input msg_sig[k];
    signal input id_num_sig[k];

    signal input scope;

    signal input forbidden_countries_list[MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH * country_length];

    signal input user_identifier;
    signal input current_date[8];
    signal input majority_age_ASCII[3];
    signal input selector_older_than;

    signal output attestation_id <== 5;

    // Convert the two decimal inputs back to bit array
    signal disclose_sel[persona_length];

    // Convert disclose_sel_low (first 121 bits) to bit array
    component low_bits = Num2Bits(compressed_bit_len);
    low_bits.in <== compressed_disclose_sel[0];

    // Convert disclose_sel_high (next 123 bits) to bit array
    component high_bits = Num2Bits(compressed_bit_len + 2);
    high_bits.in <== compressed_disclose_sel[1];

    // Combine the bit arrays (little-endian format)
    for(var i = 0; i < compressed_bit_len; i++){
        disclose_sel[i] <== low_bits.out[i];
    }
    for(var i = compressed_bit_len; i < persona_length ; i++){
        disclose_sel[i] <== high_bits.out[i - compressed_bit_len];
    }

    component msg_hasher = Sha256Bytes(PERSONA_DATA_PADDED());
    msg_hasher.paddedIn <== PersonaID_data_padded;
    msg_hasher.paddedInLength <== PERSONA_DATA_PADDED();

    //verify Hash(PersonaID_data_padded) signature
    component msg_sig_verify = SignatureVerifier(1, n, k);
    msg_sig_verify.hash <== msg_hasher.out;
    msg_sig_verify.pubKey <== pubKey;
    msg_sig_verify.signature <== msg_sig;

    //Calculate IDNUMBER hash
    signal id_num[PERSONA_ID_PADDED()];
    var idNumberIdx = ID_NUMBER_INDEX();

    // Fill the first 20 bytes with actual ID number data
    for (var i = 0; i < ID_NUMBER_LENGTH(); i++) {
        id_num[i] <== PersonaID_data_padded[idNumberIdx + i];
    }

    // Add SHA-256 padding for 20-byte message
    // Add padding bit '1' (0x80)
    id_num[ID_NUMBER_LENGTH()] <== 128; // 0x80 in decimal

    // Fill with zeros up to position 56 (64 - 8 for length field)
    for (var i = ID_NUMBER_LENGTH() + 1; i < PERSONA_ID_PADDED() - 8; i++) {
        id_num[i] <== 0;
    }

    // Add 64-bit length field (20 bytes * 8 = 160 bits)
    // Length in bits as 64-bit big-endian integer
    for (var i = PERSONA_ID_PADDED() - 8; i < PERSONA_ID_PADDED() - 1; i++) {
        id_num[i] <== 0; // High bytes are 0 for small lengths
    }
    id_num[PERSONA_ID_PADDED() - 1] <== 160; // 20 * 8 = 160 bits

    component id_num_hasher = Sha256Bytes(PERSONA_ID_PADDED());
    id_num_hasher.paddedIn <== id_num;
    id_num_hasher.paddedInLength <== PERSONA_ID_PADDED();

    //verify Hash(IdNumber) signature
    component id_num_sig_verify = SignatureVerifier(1, n, k);
    id_num_sig_verify.hash <== id_num_hasher.out;
    id_num_sig_verify.pubKey <== pubKey;
    id_num_sig_verify.signature <== id_num_sig;

    //Nullifier = HASH( nullifier sig , scope )
    component nullifierCal = CustomHasher(k + 1);
    for (var i = 0; i < k; i++) {
        nullifierCal.in[i] <== id_num_sig[i];
    }
    nullifierCal.in[k] <== scope;

    component disclose_circuit = DISCLOSE_PERSONA(MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH);

    for (var i = 0; i < persona_length; i++) {
        disclose_circuit.persona_data[i] <== PersonaID_data_padded[i];
    }
    disclose_circuit.selector_persona_data <== disclose_sel;
    disclose_circuit.forbidden_countries_list <== forbidden_countries_list;
    disclose_circuit.current_date <== current_date;
    disclose_circuit.majority_age_ASCII <== majority_age_ASCII;
    disclose_circuit.selector_older_than <== selector_older_than;

    var revealed_data_packed_chunk_length = computeIntChunkLength(persona_length + 1);
    signal output revealedData_packed[revealed_data_packed_chunk_length] <== disclose_circuit.revealedData_packed;

    var forbidden_countries_list_packed_chunk_length = computeIntChunkLength(MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH * country_length);
    signal output forbidden_countries_list_packed[forbidden_countries_list_packed_chunk_length] <== disclose_circuit.forbidden_countries_list_packed;

    signal output nullifier <== nullifierCal.out;

}

component main {
    public [
        scope,
        user_identifier,
        current_date
    ]
} = VC_AND_DISCLOSE(10, 121, 17);

pragma circom 2.1.9;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";
include "../../utils/passport/signatureVerifier.circom";
include "../../utils/passport/customHashers.circom";
include "@openpassport/zk-email-circuits/lib/sha.circom";
include "@openpassport/zk-email-circuits/lib/bigint.circom";
include "../../utils/selfrica_persona/constants.circom";
include "../../utils/selfrica_persona/persona_constants.circom";
include "../../utils/selfrica_persona/disclose/disclose.circom";
include "@zk-kit/binary-merkle-root.circom/src/binary-merkle-root.circom";

template VC_AND_DISCLOSE_SELFRICA_PERSONA(
    MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH,
    namedobTreeLevels,
    nameyobTreeLevels,
    n,
    k,
    nLevels,
    isSelfrica
) {
    var max_length = isSelfrica ? SELFRICA_MAX_LENGTH() : PERSONA_MAX_LENGTH();
    var country_length = isSelfrica ? COUNTRY_LENGTH() : PERSONA_COUNTRY_LENGTH();
    var id_number_length = isSelfrica ? ID_NUMBER_LENGTH() : PERSONA_ID_NUMBER_LENGTH();
    var idNumberIdx = isSelfrica ? ID_NUMBER_INDEX() : PERSONA_ID_NUMBER_INDEX();
    var compressed_bit_len = max_length/2;

    signal input data_padded[max_length];
    signal input compressed_disclose_sel[2];

    signal input scope;

    signal input forbidden_countries_list[MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH * country_length];

    signal input merkle_root;
    signal input leaf_depth;
    signal input path[nLevels];
    signal input siblings[nLevels];

    signal input ofac_name_dob_smt_leaf_key;
    signal input ofac_name_dob_smt_root;
    signal input ofac_name_dob_smt_siblings[namedobTreeLevels];

    signal input ofac_name_yob_smt_leaf_key;
    signal input ofac_name_yob_smt_root;
    signal input ofac_name_yob_smt_siblings[nameyobTreeLevels];

    signal input selector_ofac;
    signal input user_identifier;
    signal input current_date[8];
    signal input majority_age_ASCII[3];
    signal input secret;

    signal output attestation_id <== isSelfrica ? 4 : 5;

    // Convert the two decimal inputs back to bit array
    signal disclose_sel[max_length];

    // Convert disclose_sel_low (first 133 bits) to bit array
    component low_bits = Num2Bits(compressed_bit_len);
    low_bits.in <== compressed_disclose_sel[0];

    // Convert disclose_sel_high (next 133 bits) to bit array
    component high_bits = Num2Bits(compressed_bit_len);
    high_bits.in <== compressed_disclose_sel[1];

    // Combine the bit arrays (little-endian format)
    for(var i = 0; i < compressed_bit_len; i++){
        disclose_sel[i] <== low_bits.out[i];
    }
    for(var i = 0; i < compressed_bit_len; i++){
        disclose_sel[compressed_bit_len + i] <== high_bits.out[i];
    }

    component msg_hasher = PackBytesAndPoseidon(max_length);
    for (var i = 0; i < max_length; i++) {
        msg_hasher.in[i] <== data_padded[i];
    }

    signal leaf <== Poseidon(2)([secret, msg_hasher.out]);

    signal computedRoot <== BinaryMerkleRoot(nLevels)(leaf, leaf_depth, path, siblings);
    merkle_root === computedRoot;

    signal id_num[id_number_length];
    for (var i = 0; i < id_number_length; i++) {
        id_num[i] <== data_padded[idNumberIdx + i];
    }

    component disclose_circuit = DISCLOSE_SELFRICA_PERSONA(MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH, namedobTreeLevels, nameyobTreeLevels, isSelfrica);

    for (var i = 0; i < max_length; i++) {
        disclose_circuit.data_padded[i] <== data_padded[i];
    }
    disclose_circuit.selector_data_padded <== disclose_sel;
    disclose_circuit.forbidden_countries_list <== forbidden_countries_list;

    disclose_circuit.ofac_name_dob_smt_leaf_key <== ofac_name_dob_smt_leaf_key;
    disclose_circuit.ofac_name_dob_smt_root <== ofac_name_dob_smt_root;
    disclose_circuit.ofac_name_dob_smt_siblings <== ofac_name_dob_smt_siblings;

    disclose_circuit.ofac_name_yob_smt_leaf_key <== ofac_name_yob_smt_leaf_key;
    disclose_circuit.ofac_name_yob_smt_root <== ofac_name_yob_smt_root;
    disclose_circuit.ofac_name_yob_smt_siblings <== ofac_name_yob_smt_siblings;

    disclose_circuit.selector_ofac <== selector_ofac;
    disclose_circuit.current_date <== current_date;
    disclose_circuit.majority_age_ASCII <== majority_age_ASCII;

    var revealed_data_packed_chunk_length = computeIntChunkLength(max_length + 2 + 1);
    signal output revealedData_packed[revealed_data_packed_chunk_length] <== disclose_circuit.revealedData_packed;

    var forbidden_countries_list_packed_chunk_length = computeIntChunkLength(MAX_FORBIDDEN_COUNTRIES_LIST_LENGTH * country_length);
    signal output forbidden_countries_list_packed[forbidden_countries_list_packed_chunk_length] <== disclose_circuit.forbidden_countries_list_packed;
    signal output nullifier <== Poseidon(2)([secret, scope]);
}

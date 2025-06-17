pragma circom 2.1.9;

include "@openpassport/zk-email-circuits/utils/array.circom";
include "@openpassport/zk-email-circuits/utils/bytes.circom";
include "../../utils/crypto/bitify/bytes.circom";
include "../../utils/crypto/hasher/shaBytes/shaBytesDynamic.circom";
include "../../utils/crypto/hasher/hash.circom";
include "../../utils/passport/disclose/verify_commitment.circom";
include "../../utils/passport/customHashers.circom";


/// @title REVEAL_DG2_HASH
/// @notice Computes the hash of DG2 (passport photo) and verifies that it is equal to the hash stored inside the eContent, then proves that the resulting eContent commitment is included in the commitment merkle tree.
/// @param DG_HASH_ALGO Digest size of the DG2 hash in bits (e.g. 160 for SHA-1, 256 for SHA-256)
/// @param ECONTENT_HASH_ALGO Digest size of the eContent hash in bits
/// @param MAX_ECONTENT_PADDED_LEN Maximum padded length (in bytes) of the eContent buffer — MUST be a multiple of 64
/// @param DG2_LEN Length (in bytes) of the DG2 data group (photo) that will be hashed
/// @param nLevels Depth of the binary merkle tree that stores the commitments
/// @input secret User secret used while generating the commitment
/// @input attestation_id Attestation ID of the credential used to generate the commitment
/// @input dg1 Data group 1 of the passport (93 bytes) — needed to recompute the commitment
/// @input dsc_tree_leaf Leaf of the DSC tree
/// @input merkle_root Root of the commitment merkle tree
/// @input leaf_depth Actual size (depth) of the merkle tree
/// @input path Path from the commitment leaf to the root inside the merkle tree
/// @input siblings Sibling nodes required for merkle proof verification
/// @input photo Raw DG2 bytes
/// @input eContent contains all DG hashes
/// @input eContent_padded_length Padded length of eContent
/// @input dg2_hash_offset Offset for DG2 hash
/// @output dg2ShaBytes Byte array of the computed DG2 hash
template RevealDG2Hash(DG_HASH_ALGO,ECONTENT_HASH_ALGO,MAX_ECONTENT_PADDED_LEN,DG2_LEN,nLevels) {
    assert(MAX_ECONTENT_PADDED_LEN % 64 == 0);

    var DG1_LEN = 93;
    var DG_HASH_ALGO_BYTES = DG_HASH_ALGO / 8;
    var ECONTENT_HASH_ALGO_BYTES = ECONTENT_HASH_ALGO / 8;

    signal input secret;
    signal input attestation_id;
    signal input dg1[DG1_LEN];
    signal input dsc_tree_leaf;

    signal input merkle_root;
    signal input leaf_depth;
    signal input path[nLevels];
    signal input siblings[nLevels];

    signal input photo[DG2_LEN];
    signal input eContent[MAX_ECONTENT_PADDED_LEN];
    signal input eContent_padded_length;
    signal input dg2_hash_offset;


    // check offsets refer to valid ranges
    signal dg2OffsetInRange <== LessEqThan(12)([dg2_hash_offset + DG_HASH_ALGO_BYTES, eContent_padded_length]);
    dg2OffsetInRange === 1;

    // compute hash of DG2
    signal dg2Bits[DG2_LEN * 8] <== BytesToBitsArray(DG2_LEN)(photo);
    signal dg2ShaBits[DG_HASH_ALGO] <== ShaHashBits(DG2_LEN * 8, DG_HASH_ALGO)(dg2Bits);
    signal output dg2ShaBytes[DG_HASH_ALGO_BYTES] <== BitsToBytesArray(DG_HASH_ALGO)(dg2ShaBits);

    // assert DG2 hash matches the one in eContent
    signal dg2Hash[DG_HASH_ALGO_BYTES] <== VarShiftLeft(MAX_ECONTENT_PADDED_LEN, DG_HASH_ALGO_BYTES)(eContent, dg2_hash_offset);
    for(var i = 0; i < DG_HASH_ALGO_BYTES; i++) {
        dg2Hash[i] === dg2ShaBytes[i];
    }

    // compute hash of eContent
    signal eContentShaBits[ECONTENT_HASH_ALGO] <== ShaBytesDynamic(ECONTENT_HASH_ALGO, MAX_ECONTENT_PADDED_LEN)(eContent, eContent_padded_length);
    signal eContentShaBytes[ECONTENT_HASH_ALGO_BYTES] <== BitsToBytesArray(ECONTENT_HASH_ALGO)(eContentShaBits);
    signal eContent_shaBytes_packed_hash <== PackBytesAndPoseidon(ECONTENT_HASH_ALGO_BYTES)(eContentShaBytes);

    //verify commitment is part of the merkle tree
    VERIFY_COMMITMENT(nLevels, DG1_LEN)(
        secret,
        attestation_id,
        dg1,
        eContent_shaBytes_packed_hash,
        dsc_tree_leaf,
        merkle_root,
        leaf_depth,
        path,
        siblings
    );

}

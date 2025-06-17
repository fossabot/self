pragma circom 2.1.9;

include "../dg2hash_passport.circom";

component main{ public [merkle_root, photo, attestation_id] }  = RevealDG2Hash(384, 384, 768, 48, 33);

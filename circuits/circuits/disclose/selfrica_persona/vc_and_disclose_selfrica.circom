pragma circom 2.1.9;

include "./disclose.circom";


component main {
    public [
        scope,
        merkle_root,
        ofac_name_dob_smt_root,
        ofac_name_yob_smt_root,
        user_identifier,
        current_date
    ]
} = VC_AND_DISCLOSE_SELFRICA_PERSONA(40, 64, 64, 121, 17, 33, 1);

pragma circom 2.1.9;

/*
 * Persona Data Format (243 bytes total)
 *
 * | Field                | Index | Length |
 * |----------------------|-------|--------|
 * | Country              | 0     | 2      |
 * | ID Type              | 2     | 8      |
 * | ID Number            | 10    | 32     |
 * | Document Number      | 42    | 32     |
 * | Issuance Date        | 74    | 8      |
 * | Expiry Date          | 82    | 8      |
 * | Full Name            | 90    | 64     |
 * | Date of Birth        | 154   | 8      |
 * | Address Subdivision  | 162   | 24     |
 * | Address Postal Code  | 186   | 12     |
 * | Photo Hash           | 198   | 32     |
 * | Phone Number         | 230   | 12     |
 * | Gender               | 242   | 1      |
 */

function COUNTRY_INDEX() {
    return 0;
}

function COUNTRY_LENGTH() {
    return 2;
}

function ID_TYPE_INDEX() {
    return COUNTRY_INDEX() + COUNTRY_LENGTH();
}

function ID_TYPE_LENGTH() {
    return 8;
}

function ID_NUMBER_INDEX() {
    return ID_TYPE_INDEX() + ID_TYPE_LENGTH();
}

function ID_NUMBER_LENGTH() {
    return 32;
}

function DOCUMENT_NUMBER_INDEX() {
    return ID_NUMBER_INDEX() + ID_NUMBER_LENGTH();
}

function DOCUMENT_NUMBER_LENGTH() {
    return 32;
}

function ISSUANCE_DATE_INDEX() {
    return DOCUMENT_NUMBER_INDEX() + DOCUMENT_NUMBER_LENGTH();
}

function ISSUANCE_DATE_LENGTH() {
    return 8;
}

function EXPIRATION_DATE_INDEX() {
    return ISSUANCE_DATE_INDEX() + ISSUANCE_DATE_LENGTH();
}

function EXPIRATION_DATE_LENGTH() {
    return 8;
}

function FULL_NAME_INDEX() {
    return EXPIRATION_DATE_INDEX() + EXPIRATION_DATE_LENGTH();
}

function FULL_NAME_LENGTH() {
    return 64;
}

function DOB_INDEX() {
    return FULL_NAME_INDEX() + FULL_NAME_LENGTH();
}

function DOB_LENGTH() {
    return 8;
}

function ADDRESS_SUBDIVISION_INDEX() {
    return DOB_INDEX() + DOB_LENGTH();
}

function ADDRESS_SUBDIVISION_LENGTH() {
    return 24;
}

function ADDRESS_POSTAL_CODE_INDEX() {
    return ADDRESS_SUBDIVISION_INDEX() + ADDRESS_SUBDIVISION_LENGTH();
}

function ADDRESS_POSTAL_CODE_LENGTH() {
    return 12;
}

function PHOTO_HASH_INDEX() {
    return ADDRESS_POSTAL_CODE_INDEX() + ADDRESS_POSTAL_CODE_LENGTH();
}

function PHOTO_HASH_LENGTH() {
    return 32;
}

function PHONE_NUMBER_INDEX() {
    return PHOTO_HASH_INDEX() + PHOTO_HASH_LENGTH();
}

function PHONE_NUMBER_LENGTH() {
    return 12;
}

function GENDER_INDEX() {
    return PHONE_NUMBER_INDEX() + PHONE_NUMBER_LENGTH();
}

function GENDER_LENGTH() {
    return 1;
}

function PERSONA_MAX_LENGTH() {
    return GENDER_INDEX() + GENDER_LENGTH();
}

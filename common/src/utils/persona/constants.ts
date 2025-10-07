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

export const PERSONA_COUNTRY_INDEX = 0;
export const PERSONA_COUNTRY_LENGTH = 2;

export const PERSONA_ID_TYPE_INDEX = PERSONA_COUNTRY_INDEX + PERSONA_COUNTRY_LENGTH;
export const PERSONA_ID_TYPE_LENGTH = 8;

export const PERSONA_ID_NUMBER_INDEX = PERSONA_ID_TYPE_INDEX + PERSONA_ID_TYPE_LENGTH;
export const PERSONA_ID_NUMBER_LENGTH = 32;

export const PERSONA_DOCUMENT_NUMBER_INDEX = PERSONA_ID_NUMBER_INDEX + PERSONA_ID_NUMBER_LENGTH;
export const PERSONA_DOCUMENT_NUMBER_LENGTH = 32;

export const PERSONA_ISSUANCE_DATE_INDEX = PERSONA_DOCUMENT_NUMBER_INDEX + PERSONA_DOCUMENT_NUMBER_LENGTH;
export const PERSONA_ISSUANCE_DATE_LENGTH = 8;

export const PERSONA_EXPIRATION_DATE_INDEX = PERSONA_ISSUANCE_DATE_INDEX + PERSONA_ISSUANCE_DATE_LENGTH;
export const PERSONA_EXPIRATION_DATE_LENGTH = 8;

export const PERSONA_FULL_NAME_INDEX = PERSONA_EXPIRATION_DATE_INDEX + PERSONA_EXPIRATION_DATE_LENGTH;
export const PERSONA_FULL_NAME_LENGTH = 64;

export const PERSONA_DOB_INDEX = PERSONA_FULL_NAME_INDEX + PERSONA_FULL_NAME_LENGTH;
export const PERSONA_DOB_LENGTH = 8;

export const PERSONA_ADDRESS_SUBDIVISION_INDEX = PERSONA_DOB_INDEX + PERSONA_DOB_LENGTH;
export const PERSONA_ADDRESS_SUBDIVISION_LENGTH = 24;

export const PERSONA_ADDRESS_POSTAL_CODE_INDEX = PERSONA_ADDRESS_SUBDIVISION_INDEX + PERSONA_ADDRESS_SUBDIVISION_LENGTH;
export const PERSONA_ADDRESS_POSTAL_CODE_LENGTH = 12;

export const PERSONA_PHOTO_HASH_INDEX = PERSONA_ADDRESS_POSTAL_CODE_INDEX + PERSONA_ADDRESS_POSTAL_CODE_LENGTH;
export const PERSONA_PHOTO_HASH_LENGTH = 32;

export const PERSONA_PHONE_NUMBER_INDEX = PERSONA_PHOTO_HASH_INDEX + PERSONA_PHOTO_HASH_LENGTH;
export const PERSONA_PHONE_NUMBER_LENGTH = 12;

export const PERSONA_GENDER_INDEX = PERSONA_PHONE_NUMBER_INDEX + PERSONA_PHONE_NUMBER_LENGTH;
export const PERSONA_GENDER_LENGTH = 1;

export const PERSONA_MAX_LENGTH = PERSONA_GENDER_INDEX + PERSONA_GENDER_LENGTH;

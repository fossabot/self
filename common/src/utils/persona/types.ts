import {
  PERSONA_COUNTRY_LENGTH,
  PERSONA_ID_TYPE_LENGTH,
  PERSONA_ID_NUMBER_LENGTH,
  PERSONA_DOCUMENT_NUMBER_LENGTH,
  PERSONA_ISSUANCE_DATE_LENGTH,
  PERSONA_EXPIRATION_DATE_LENGTH,
  PERSONA_FULL_NAME_LENGTH,
  PERSONA_DOB_LENGTH,
  PERSONA_ADDRESS_SUBDIVISION_LENGTH,
  PERSONA_ADDRESS_POSTAL_CODE_LENGTH,
  PERSONA_PHOTO_HASH_LENGTH,
  PERSONA_PHONE_NUMBER_LENGTH,
  PERSONA_GENDER_LENGTH,
} from './constants.js';

export interface PersonaData {
  country: string;              // 2 bytes - ISO-3166-1 alpha-2
  idType: string;               // 8 bytes - id-class (pp, dl, nric, tribalid)
  idNumber: string;             // 32 bytes - identification-number
  documentNumber: string;       // 32 bytes - document-number (may be blank)
  issuanceDate: string;         // 8 bytes - issue-date as YYYYMMDD
  expiryDate: string;           // 8 bytes - expiration-date as YYYYMMDD
  fullName: string;             // 64 bytes - name-first + name-middle? + name-last
  dob: string;                  // 8 bytes - birthdate as YYYYMMDD
  addressSubdivision: string;   // 24 bytes - address-subdivision
  addressPostalCode: string;    // 12 bytes - address-postal-code
  photoHash: string;            // 32 bytes - SHA-256 of stored ID image
  phoneNumber: string;          // 12 bytes - E.164 format
  gender: string;               // 1 byte - sex mapped to M/F/X/-
}

export const PersonaDataLimits = {
  country: PERSONA_COUNTRY_LENGTH,
  idType: PERSONA_ID_TYPE_LENGTH,
  idNumber: PERSONA_ID_NUMBER_LENGTH,
  documentNumber: PERSONA_DOCUMENT_NUMBER_LENGTH,
  issuanceDate: PERSONA_ISSUANCE_DATE_LENGTH,
  expiryDate: PERSONA_EXPIRATION_DATE_LENGTH,
  fullName: PERSONA_FULL_NAME_LENGTH,
  dob: PERSONA_DOB_LENGTH,
  addressSubdivision: PERSONA_ADDRESS_SUBDIVISION_LENGTH,
  addressPostalCode: PERSONA_ADDRESS_POSTAL_CODE_LENGTH,
  photoHash: PERSONA_PHOTO_HASH_LENGTH,
  phoneNumber: PERSONA_PHONE_NUMBER_LENGTH,
  gender: PERSONA_GENDER_LENGTH,
};

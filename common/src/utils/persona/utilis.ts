import { PERSONA_MAX_LENGTH } from "./constants.js";
import { PersonaData, PersonaDataLimits } from "./types.js";

export const PERSONA_DUMMY_INPUT: PersonaData = {
  country: 'US',
  idType: 'tribalid',
  idNumber: 'Y123ABC',
  documentNumber: '585225',
  issuanceDate: '20200728',
  expiryDate: '20300101',
  fullName: 'JANE DOE',
  dob: '19900101',
  addressSubdivision: 'CA',
  addressPostalCode: '94105',
  photoHash: '1234567890abcdef123',
  phoneNumber: '+12345678901',
  gender: 'M',
};

export function validateAndPadPersonaData(data: PersonaData): PersonaData {
  const result: PersonaData = {} as PersonaData;

  for (const [field, value] of Object.entries(data)) {
    const maxLength = PersonaDataLimits[field as keyof typeof PersonaDataLimits];

    if (maxLength && value.length > maxLength) {
      throw new Error(`Field '${field}' too long: ${value.length} > ${maxLength}`);
    }
    result[field as keyof PersonaData] = maxLength ? value.padEnd(maxLength, '\0') : value;
  }
  return result;
}

export function serializePersonaData(personaData: PersonaData): string {
  let serializedData = '';

  serializedData += personaData.country;
  serializedData += personaData.idType;
  serializedData += personaData.idNumber;
  serializedData += personaData.documentNumber;
  serializedData += personaData.issuanceDate;
  serializedData += personaData.expiryDate;
  serializedData += personaData.fullName;
  serializedData += personaData.dob;
  serializedData += personaData.addressSubdivision;
  serializedData += personaData.addressPostalCode;
  serializedData += personaData.photoHash;
  serializedData += personaData.phoneNumber;
  serializedData += personaData.gender;

  return serializedData;
}

export function generatePersonaSelector(fields: string[]): string[] {
  const validFields = Object.keys(PersonaDataLimits);
  const invalidFields = fields.filter(field => !validFields.includes(field));

  if (invalidFields.length > 0) {
    throw new Error(`Invalid field(s): ${invalidFields.join(', ')}. Valid fields are: ${validFields.join(', ')}`);
  }

  const totalLength = PERSONA_MAX_LENGTH;
  const selector = new Array(totalLength).fill('0');
  let index = 0;

  for (const [field, length] of Object.entries(PersonaDataLimits)) {
    if (fields.includes(field)) {
      selector.fill('1', index, index + length);
    }
    index += length;
  }
  return selector;
}

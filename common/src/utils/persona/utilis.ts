import { formatInput } from "../circuits/generateInputs.js";
import { generateRSAKeyPair, signRSA, verifyRSA } from "../selfrica/rsa.js";
import { PERSONA_ID_NUMBER_INDEX, PERSONA_ID_NUMBER_LENGTH, PERSONA_MAX_LENGTH } from "./constants.js";
import { PersonaData, PersonaDataLimits, PersonaDiscloseInput } from "./types.js";
import { sha256Pad } from '@zk-email/helpers/dist/sha-utils.js';
import crypto from "crypto";
import { splitToWords } from "../bytes.js";

export const splitDiscloseSelPersona = (disclose_sel: string[]): string[] => {
  if (disclose_sel.length !== PERSONA_MAX_LENGTH) {
      throw new Error(`disclose_sel must have length ${PERSONA_MAX_LENGTH}, got ${disclose_sel.length}`);
  }

  // Split into two arrays of 133 bits each
  const disclose_sel_low_bits = disclose_sel.slice(0, 121);
  const disclose_sel_high_bits = disclose_sel.slice(121, PERSONA_MAX_LENGTH);

  // Convert little-endian bit arrays to decimal
  const bitsToDecimal = (bits: string[]): string => {
      let result = BigInt(0);
      for (let i = 0; i < bits.length; i++) {
          if (bits[i] === '1') {
              result += BigInt(1) << BigInt(i);
          }
      }
      return result.toString();
  };

  return [bitsToDecimal(disclose_sel_low_bits), bitsToDecimal(disclose_sel_high_bits)];
};

export const PERSONA_DUMMY_INPUT: PersonaData = {
  country: 'USA',
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

export const generatePersonaCircuitInput = (personaData: PersonaData, selector_fields: string[]) => {
  const personaDataPadded = validateAndPadPersonaData(personaData);
  const msg = Buffer.from(serializePersonaData(personaDataPadded), 'utf8');
  const msgArray = Array.from(msg);

  const { publicKey, privateKey } = generateRSAKeyPair();
  const [msgPadded, _]= sha256Pad(msg, 320);

  const msg_rsaSig = signRSA(msg, privateKey);
  console.assert(verifyRSA(msg, msg_rsaSig, publicKey) == true, "Invalid RSA signature");


  const sigBigInt = BigInt('0x' + msg_rsaSig.toString('hex'));

  const idNumber = Buffer.from(msgArray.slice(PERSONA_ID_NUMBER_INDEX, PERSONA_ID_NUMBER_INDEX + PERSONA_ID_NUMBER_LENGTH));

  const id_num_rsaSig = signRSA(idNumber, privateKey);
  console.assert(verifyRSA(idNumber, id_num_rsaSig, publicKey) == true, "Invalid nullifier RSA signature");

  const nullifierSigBigInt = BigInt('0x' + id_num_rsaSig.toString('hex'));

  const publicKeyObject = crypto.createPublicKey(publicKey);
  const jwk = publicKeyObject.export({ format: 'jwk' });
  const rsaModulus = BigInt('0x' + Buffer.from(jwk.n as string, 'base64url').toString('hex'));

  const disclose_sel_array = generatePersonaSelector(selector_fields);

  const circuitInput: PersonaDiscloseInput = {
    PersonaID_data_padded: formatInput(msgPadded),
    compressed_disclose_sel: splitDiscloseSelPersona(disclose_sel_array),
    pubKey: splitToWords(rsaModulus, 121, 17),
    msg_sig: splitToWords(sigBigInt, 121, 17),
    scope: '0',
    id_num_sig: splitToWords(nullifierSigBigInt, 121, 17),
    forbidden_countries_list: [...Array(30)].map((x) => '0'),
    user_identifier: '0',
    current_date: ['2', '0', '2', '5', '0', '1', '0', '1'],
    majority_age_ASCII: ['0', '0', '5'].map((x) => x.charCodeAt(0).toString()),
    selector_older_than: '0',
  }

  return circuitInput;
}

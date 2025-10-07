import { assert, expect } from 'chai';
import { wasm as wasmTester } from 'circom_tester';
import { describe, it, before } from 'mocha';
import * as path from 'path';
import { generatePersonaSelector, PERSONA_DUMMY_INPUT, serializePersonaData, validateAndPadPersonaData } from '@selfxyz/common/utils/persona/utilis';
import { PERSONA_ADDRESS_SUBDIVISION_INDEX, PERSONA_COUNTRY_INDEX, PERSONA_DOB_INDEX, PERSONA_DOCUMENT_NUMBER_INDEX, PERSONA_EXPIRATION_DATE_INDEX, PERSONA_FULL_NAME_INDEX, PERSONA_GENDER_INDEX, PERSONA_ID_NUMBER_INDEX, PERSONA_ID_TYPE_INDEX, PERSONA_ISSUANCE_DATE_INDEX, PERSONA_MAX_LENGTH, PERSONA_PHOTO_HASH_INDEX } from '@selfxyz/common/utils/persona/constants';
import { formatInput } from '@selfxyz/common/utils/circuits/generateInputs';
import { unpackReveal } from '@selfxyz/common/utils/circuits/formatOutputs';

interface DisclosePersonaInputs {
    persona_data: string[];
    selector_persona_data: string[];
    current_date: string[];
    majority_age_ASCII: string[];
    selector_older_than: string;
    forbidden_countries_list: string[];
}


describe('disclose persona test', async () => {
    let circuit;
    let personaDataArray;

    before(async () => {
        const dummyPersonaData = validateAndPadPersonaData(PERSONA_DUMMY_INPUT);
        const serializedPersonaData = Buffer.from(serializePersonaData(dummyPersonaData), 'utf8');
        personaDataArray = Array.from(serializedPersonaData);
        circuit = await wasmTester(
            path.join(__dirname, "disclose_test.circom"),
            {
                include: [
                    'node_modules',
                    'node_modules/circomlib/circuits',
                ],
            }
        );
    });

    it('should compile and load the circuit', async () => {
        expect(circuit).to.not.be.undefined;
    });
    it('should calculate witness and pass constrain check', async function () {
        this.timeout(0);
        const inputs: DisclosePersonaInputs = {
            persona_data: formatInput(personaDataArray),
            selector_persona_data: Array(PERSONA_MAX_LENGTH).fill('1'),
            current_date: ['2', '0', '2', '5', '0', '1', '0', '1'],
            majority_age_ASCII: ['0', '0', '5'].map((x) => x.charCodeAt(0).toString()),
            selector_older_than: '1',
            forbidden_countries_list: Array(20).fill('0'),
        };
        const w = await circuit.calculateWitness(inputs);
        await circuit.checkConstraints(w);
    });

    it('should reveal only gender and majority age', async function () {
        this.timeout(0);
        const inputs: DisclosePersonaInputs = {
            persona_data: formatInput(personaDataArray),
            selector_persona_data: generatePersonaSelector(['gender']),
            current_date: ['2', '0', '2', '5', '0', '1', '0', '1'],
            majority_age_ASCII: ['0', '0', '5'].map((x) => x.charCodeAt(0).toString()),
            selector_older_than: '1',
            forbidden_countries_list: Array(20).fill('0'),
        };

        const w = await circuit.calculateWitness(inputs);
        await circuit.checkConstraints(w);

        const revealedData = await circuit.getOutput(w, ['revealedData_packed[8]']);
        const revealedData_packed = [
            revealedData['revealedData_packed[0]'],
            revealedData['revealedData_packed[1]'],
            revealedData['revealedData_packed[2]'],
            revealedData['revealedData_packed[3]'],
            revealedData['revealedData_packed[4]'],
            revealedData['revealedData_packed[5]'],
            revealedData['revealedData_packed[6]'],
            revealedData['revealedData_packed[7]'],
        ];
        const revealedDataUnpacked = unpackReveal(revealedData_packed, 'id');
        const gender = revealedDataUnpacked[PERSONA_GENDER_INDEX];
        assert(gender === 'M', 'Gender should be Male');

        // Check that all Persona fields except gender are zero
        for (let i = 0; i < PERSONA_MAX_LENGTH; i++) {
            if (i === PERSONA_GENDER_INDEX) continue;
            const charCode = revealedDataUnpacked[i].charCodeAt(0);
            assert(
                charCode === 0,
                `Field at index ${i} should be zero (charCode: 0), got charCode: ${charCode} (char: '${revealedDataUnpacked[i]}')`
            );
        }

        const majority_age = revealedDataUnpacked[PERSONA_MAX_LENGTH].charCodeAt(0);
        assert(majority_age === 5, 'Majority age should be 5');
    });
    it('should reveal all except gender and majority age', async function () {

        const inputs: DisclosePersonaInputs = {
            persona_data: formatInput(personaDataArray),
            selector_persona_data: generatePersonaSelector(['country', 'idType', 'idNumber', 'documentNumber', 'issuanceDate', 'expiryDate', 'fullName', 'dob', 'addressSubdivision', 'photoHash']),
            current_date: ['2', '0', '2', '5', '0', '1', '0', '1'],
            majority_age_ASCII: ['0', '0', '5'].map((x) => x.charCodeAt(0).toString()),
            selector_older_than: '0',
            forbidden_countries_list: Array(20).fill('0'),
        };

        const w = await circuit.calculateWitness(inputs);
        await circuit.checkConstraints(w);

        const revealedData = await circuit.getOutput(w, ['revealedData_packed[8]']);
        const revealedData_packed = [
            revealedData['revealedData_packed[0]'],
            revealedData['revealedData_packed[1]'],
            revealedData['revealedData_packed[2]'],
            revealedData['revealedData_packed[3]'],
            revealedData['revealedData_packed[4]'],
            revealedData['revealedData_packed[5]'],
            revealedData['revealedData_packed[6]'],
            revealedData['revealedData_packed[7]'],
        ];
        const revealedDataUnpacked = unpackReveal(revealedData_packed, 'id');
        const gender = revealedDataUnpacked[PERSONA_GENDER_INDEX];
        assert(gender.charCodeAt(0) === 0, 'Gender should be null (not revealed)');

        const country = revealedDataUnpacked.slice(PERSONA_COUNTRY_INDEX, PERSONA_COUNTRY_INDEX + 2);
        const countryStr = country.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(countryStr === 'US', 'Country should be US');

        const idType = revealedDataUnpacked.slice(PERSONA_ID_TYPE_INDEX, PERSONA_ID_TYPE_INDEX + 8);
        const idTypeStr = idType.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(idTypeStr === 'tribalid', 'Id Type should be tribalid');

        const idNumber = revealedDataUnpacked.slice(PERSONA_ID_NUMBER_INDEX, PERSONA_ID_NUMBER_INDEX + 32);
        const idNumberStr = idNumber.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(idNumberStr === 'Y123ABC', 'Id Number should be Y123ABC');

        const documentNumber = revealedDataUnpacked.slice(PERSONA_DOCUMENT_NUMBER_INDEX, PERSONA_DOCUMENT_NUMBER_INDEX + 32);
        const documentNumberStr = documentNumber.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(documentNumberStr === '585225', 'Document Number should be empty');

        const issuanceDate = revealedDataUnpacked.slice(PERSONA_ISSUANCE_DATE_INDEX, PERSONA_ISSUANCE_DATE_INDEX + 8);
        const issuanceDateStr = issuanceDate.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(issuanceDateStr === '20200728', 'Issuance Date should be 20200728');

        const expiryDate = revealedDataUnpacked.slice(PERSONA_EXPIRATION_DATE_INDEX, PERSONA_EXPIRATION_DATE_INDEX + 8);
        const expiryDateStr = expiryDate.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(expiryDateStr === '20300101', 'Expiry Date should be 20300101');

        const fullName = revealedDataUnpacked.slice(PERSONA_FULL_NAME_INDEX, PERSONA_FULL_NAME_INDEX + 64);
        const fullNameStr = fullName.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(fullNameStr === 'JANE DOE', 'Full Name should be JANE DOE');

        const dob = revealedDataUnpacked.slice(PERSONA_DOB_INDEX, PERSONA_DOB_INDEX + 8);
        const dobStr = dob.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(dobStr === '19900101', 'Date of Birth should be 19900101');

        const addressSubdivision = revealedDataUnpacked.slice(PERSONA_ADDRESS_SUBDIVISION_INDEX, PERSONA_ADDRESS_SUBDIVISION_INDEX + 24);
        const addressSubdivisionStr = addressSubdivision.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(addressSubdivisionStr === 'CA', 'Address Subdivision should be CA');

        const photoHash = revealedDataUnpacked.slice(PERSONA_PHOTO_HASH_INDEX, PERSONA_PHOTO_HASH_INDEX + 32);
        const photoHashStr = photoHash.map(c => c.charCodeAt(0) === 0 ? '' : c).join('');
        assert(photoHashStr === '1234567890abcdef123', 'Photo Hash should be 1234567890abcdef123');

        const majority_age = revealedDataUnpacked[PERSONA_MAX_LENGTH].charCodeAt(0);
        assert(majority_age === 0, `Majority age should be 0, got ${majority_age}`);

    });

    it('should fail for invalid majority age', async function () {

        const inputs: DisclosePersonaInputs = {
            persona_data: formatInput(personaDataArray),
            selector_persona_data: generatePersonaSelector(['country']),
            current_date: ['2', '0', '2', '5', '0', '1', '0', '1'],
            majority_age_ASCII: ['A', 'B', 'C'].map((x) => x.charCodeAt(0).toString()),
            selector_older_than: '0',
            forbidden_countries_list: Array(20).fill('0'),
        };

        try {
            const w = await circuit.calculateWitness(inputs);
            await circuit.checkConstraints(w);
            expect.fail('Expected an error but none was thrown.');
        } catch (error) {
            expect(error.message).to.include('Assert Failed');
        }
    });

    it('should fail if present country is in the forbidden countries list', async function () {
        const inputs: DisclosePersonaInputs = {
            persona_data: formatInput(personaDataArray),
            selector_persona_data: generatePersonaSelector(['country']),
            current_date: ['2', '0', '2', '5', '0', '1', '0', '1'],
            majority_age_ASCII: ['0', '0', '5'].map((x) => x.charCodeAt(0).toString()),
            selector_older_than: '0',
            forbidden_countries_list: [
                'U'.charCodeAt(0).toString(),
                'S'.charCodeAt(0).toString(),
                ...Array(18).fill('0')
            ]
        };

        try {
            const w = await circuit.calculateWitness(inputs);
            await circuit.checkConstraints(w);
            expect.fail('Expected an error but none was thrown.');
        } catch (error) {
            expect(error.message).to.include('Assert Failed');
        }
    });


});

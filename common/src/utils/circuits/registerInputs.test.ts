import { describe, expect, it, vi } from 'vitest';

import dobOfacTree from '../../../../circuits/tests/consts/ofac/nameAndDobSMT.json';
import dobOfacTree_ID from '../../../../circuits/tests/consts/ofac/nameAndDobSMT_ID.json';
import yearOfacTree from '../../../../circuits/tests/consts/ofac/nameAndYobSMT.json';
import yearOfacTree_ID from '../../../../circuits/tests/consts/ofac/nameAndYobSMT_ID.json';
import nationOfacTree from '../../../../circuits/tests/consts/ofac/passportNoAndNationalitySMT.json';
import commitmentTree from '../../../tests/fixturess/commitmentTree.json';
import { SelfApp } from '../appType';
import { OfacTree } from '../types';
import { generateTEEInputsDiscloseStateless } from './registerInputs';
// Only mock network/local utility calls
vi.mock('../../utils/index.js', () => {
  return {
    generateCircuitInputsVCandDisclose: vi.fn(() => 'dummyInputs'),
    calculateUserIdentifierHash: vi.fn(() => 'dummyUserHash'),
    hashEndpointWithScope: vi.fn(() => 'dummyScopeHash'),
  };
});

const dummySecret = 'secret123';
const selfAppBase: SelfApp = {
  scope: 'scope1',
  disclosures: {
    ofac: false,
    excludedCountries: ['USA'],
    minimumAge: 18,
  },
  endpoint: 'https://example.com',
  endpointType: 'staging_celo',
  userId: 'user123',
  userDefinedData: 'data',
  chainID: 42220,
  appName: 'Test',
  logoBase64: '',
  deeplinkCallback: '',
  header: '',
  sessionId: '',
  userIdType: 'hex',
  devMode: true,
  version: 0,
};

describe('generateTEEInputsDiscloseStateless', () => {
  // Helper to create a valid ofac tree for a given document type.
  function makeValidOfacTree(document: 'passport' | 'id_card'): OfacTree {
    if (document === 'passport') {
      return {
        nameAndDob: JSON.stringify(dobOfacTree),
        nameAndYob: JSON.stringify(yearOfacTree),
        passportNoAndNationality: JSON.stringify(nationOfacTree),
      };
    }
    return {
      nameAndDob: JSON.stringify(dobOfacTree_ID),
      nameAndYob: JSON.stringify(yearOfacTree_ID),
      passportNoAndNationality: null,
    };
  }

  // Fake getTree callback: returns proper tree based on tree type.
  const makeGetTree = (document: 'passport' | 'id_card', overrideOfac?: any) => {
    return <T extends 'ofac' | 'commitment'>(doc: string, tree: T) => {
      if (tree === 'ofac') {
        if (overrideOfac !== undefined) return overrideOfac;
        return makeValidOfacTree(document);
      }
      if (tree === 'commitment') {
        return commitmentTree.data;
      }

      return null;
    };
  };

  it('returns valid output for passport document', () => {
    const passportData = { documentCategory: 'passport' } as any;
    const getTree = makeGetTree('passport');
    const result = generateTEEInputsDiscloseStateless(
      dummySecret,
      passportData,
      selfAppBase,
      getTree
    );
    expect(result).toHaveProperty('inputs');
    expect(result).toHaveProperty('circuitName', 'vc_and_disclose');
    expect(result).toHaveProperty('endpointType', selfAppBase.endpointType);
    expect(result).toHaveProperty('endpoint', selfAppBase.endpoint);
  });

  it('returns valid output for id_card document', () => {
    const passportData = { documentCategory: 'id_card' } as any;
    const getTree = makeGetTree('id_card');
    const result = generateTEEInputsDiscloseStateless(
      dummySecret,
      passportData,
      selfAppBase,
      getTree
    );
    expect(result).toHaveProperty('inputs', 'dummyInputs');
    expect(result).toHaveProperty('circuitName', 'vc_and_disclose_id');
    expect(result).toHaveProperty('endpointType', selfAppBase.endpointType);
    expect(result).toHaveProperty('endpoint', selfAppBase.endpoint);
  });

  it('throws if getTree returns null for ofac trees', () => {
    const passportData = { documentCategory: 'id_card' } as any;
    const getTree = <T extends 'ofac' | 'commitment'>(doc: string, tree: T) => {
      return null;
    };
    expect(() =>
      // @ts-expect-error
      generateTEEInputsDiscloseStateless(dummySecret, passportData, selfAppBase, getTree)
    ).toThrowError('OFAC trees not loaded');
  });

  it('throws if ofac tree is missing required fields (nameAndDob/nameAndYob)', () => {
    const passportData = { documentCategory: 'id_card' } as any;
    const incompleteOfacTree = { nameAndDob: null, nameAndYob: null };
    const getTree = makeGetTree('id_card', incompleteOfacTree);
    expect(() =>
      generateTEEInputsDiscloseStateless(dummySecret, passportData, selfAppBase, getTree)
    ).toThrowError('Invalid OFAC tree structure: missing required fields');
  });

  it('throws if passport document is missing passportNoAndNationality', () => {
    const passportData = { documentCategory: 'passport' } as any;
    const ofacTree = {
      nameAndDob: ['dummy'],
      nameAndYob: ['dummy'],
      // passportNoAndNationality is missing
    };
    const getTree = makeGetTree('passport', ofacTree);
    expect(() =>
      generateTEEInputsDiscloseStateless(dummySecret, passportData, selfAppBase, getTree)
    ).toThrowError('Invalid OFAC tree structure: missing passportNoAndNationality for passport');
  });
});

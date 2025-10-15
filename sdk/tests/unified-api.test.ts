import { expect } from 'chai';
import { describe } from 'mocha';
import {
  callAPI,
  compareAPIs,
  setupTestData,
  getProof,
  getUserContextData,
  getInvalidUserContextData,
  setupTestDataAadhaar,
} from './utils.ts';
import { getRevealedDataBytes } from '../core/src/utils/proof.js';
import { packBytes, packBytesArray } from '../../common/src/utils/bytes.js';

const TS_API_URL = 'http://localhost:3000';
const GO_API_URL = 'http://localhost:8080';

async function runTest(
  requestBody: any,
  expectedStatus: number = 200,
  expectedKeywords: string[] = [],
): Promise<void> {
  const [tsResponse, goResponse] = await Promise.all([
    callAPI(TS_API_URL, requestBody),
    callAPI(GO_API_URL, requestBody),
  ]);

  const result = compareAPIs(
    tsResponse,
    goResponse,
    expectedStatus,
    expectedKeywords,
  );

  if (!result.passed) {
    expect.fail(`Test failed: ${result.issues.join('; ')}`);
  }
}

describe('Self SDK Passport API Comparison Tests', function () {
  this.timeout(0);

  const validUserContext = getUserContextData();
  const invalidUserContext = getInvalidUserContextData();

  before(async () => {
    await setupTestData('1');
  });

  describe('API Verification Tests Passport', function () {
    it('should verify valid proof successfully', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals,
          userContextData: validUserContext,
        },
        200,
      );
    });

    it('should reject invalid user context', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals,
          userContextData: invalidUserContext,
        },
        500,
        ['context hash does not match', 'circuit'],
      );
    });

    it('should reject invalid scope', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals: publicSignals.map((sig, i) =>
            i === 19
              ? '17121382998761176299335602807450250650083579600718579431641003529012841023067'
              : sig,
          ),
          userContextData: validUserContext,
        },
        500,
        ['Scope'],
      );
    });

    it('should reject invalid merkle root', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals: publicSignals.map((sig, i) =>
            i === 9
              ? '9656656992379025128519272376477139373854042233370909906627112932049610896732'
              : sig,
          ),
          userContextData: validUserContext,
        },
        500,
        ['Onchain root'],
      );
    });

    it('should reject attestation ID mismatch', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals,
          userContextData: validUserContext,
        },
        500,
        ['Attestation ID', 'does not match', 'circuit'],
      );
    });

    it('should reject forbidden countries list mismatch', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals: publicSignals.map((sig, i) =>
            i === 3 ? '91625632383317' : sig,
          ),
          userContextData: validUserContext,
        },
        500,
        ['Forbidden countries', 'does not match', 'circuit'],
      );
    });

    it('should reject minimum age mismatch', async function () {
      const { proof, publicSignals } = getProof();
      const bytes = getRevealedDataBytes(1, publicSignals);
      bytes[88] = 50;
      bytes[89] = 53;
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals: [
            ...packBytes(bytes).map(p => p.toString()),
            ...publicSignals.slice(3),
          ],
          userContextData: validUserContext,
        },
        500,
        ['Minimum age', 'does not match', 'circuit', '25'],
      );
    });

    it('should reject ConfigID not found', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals,
          userContextData: validUserContext.slice(0, -1) + '7',
        },
        500,
        ['Config Id not found'],
      );
    });

    it('should reject Config not found', async function () {
      const { proof, publicSignals } = getProof();
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals,
          userContextData: validUserContext.slice(0, -1) + '5',
        },
        500,
        ['Config not found'],
      );
    });

    it('should reject future timestamp', async function () {
      const { proof, publicSignals } = getProof();
      const date = new Date();
      date.setDate(date.getDate() + 3);
      const [yy, mm, dd] = [
        date.getFullYear().toString().slice(-2),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ];
      const dateMap = { 10: yy[0], 11: yy[1], 12: mm[0], 13: mm[1], 14: dd[0], 15: dd[1] };
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals: publicSignals.map((sig, i) => dateMap[i] ?? sig),
          userContextData: validUserContext,
        },
        500,
        ['Circuit timestamp is in the future'],
      );
    });

    it('should reject old timestamp', async function () {
      const { proof, publicSignals } = getProof();
      const date = new Date();
      date.setDate(date.getDate() - 3);
      const [yy, mm, dd] = [
        date.getFullYear().toString().slice(-2),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ];
      const dateMap = { 10: yy[0], 11: yy[1], 12: mm[0], 13: mm[1], 14: dd[0], 15: dd[1] };
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals: publicSignals.map((sig, i) => dateMap[i] ?? sig),
          userContextData: validUserContext,
        },
        500,
        ['Circuit timestamp is too old'],
      );
    });
  });
});

describe('Self SDK EU ID Card API Comparison Tests', function () {
  this.timeout(0);

  const validUserContext = getUserContextData();
  const invalidUserContext = getInvalidUserContextData();
  let euIdTestData: any = null;

  before(async () => {
    await setupTestData('2');
    euIdTestData = getProof();
  });

  describe('EU ID Card API Verification Tests', function () {
    it('should verify valid EU ID card proof successfully', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals,
          userContextData: validUserContext,
        },
        200,
      );
    });

    it('should reject invalid user context', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals,
          userContextData: invalidUserContext,
        },
        500,
        ['context hash does not match', 'circuit'],
      );
    });

    it('should reject invalid scope', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals: publicSignals.map((sig, i) =>
            i === 19
              ? '17121382998761176299335602807450250650083579600718579431641003529012841023067'
              : sig,
          ),
          userContextData: validUserContext,
        },
        500,
        ['Scope'],
      );
    });

    it('should reject invalid merkle root', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals: publicSignals.map((sig, i) =>
            i === 10
              ? '9656656992379025128519272376477139373854042233370909906627112932049610896732'
              : sig,
          ),
          userContextData: validUserContext,
        },
        500,
        ['Onchain root'],
      );
    });

    it('should reject attestation ID mismatch', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 1,
          proof,
          publicSignals,
          userContextData: validUserContext,
        },
        500,
        ['Attestation ID', 'does not match', 'circuit'],
      );
    });

    it('should reject forbidden countries list mismatch', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals: publicSignals.map((sig, i) =>
            i === 4 ? '91625632383317' : sig,
          ),
          userContextData: validUserContext,
        },
        500,
        ['Forbidden countries', 'does not match', 'circuit'],
      );
    });

    it('should reject minimum age mismatch', async function () {
      const { proof, publicSignals } = euIdTestData;
      const bytes = getRevealedDataBytes(2, publicSignals);
      bytes[90] = 50;
      bytes[91] = 53;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals: [
            ...packBytesArray(bytes).map(p => p.toString()),
            ...publicSignals.slice(4),
          ],
          userContextData: validUserContext,
        },
        500,
        ['Minimum age', 'does not match', 'circuit', '25'],
      );
    });

    it('should reject ConfigID not found', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals,
          userContextData: validUserContext.slice(0, -1) + '7',
        },
        500,
        ['Config Id not found'],
      );
    });

    it('should reject Config not found', async function () {
      const { proof, publicSignals } = euIdTestData;
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals,
          userContextData: validUserContext.slice(0, -1) + '5',
        },
        500,
        ['Config not found'],
      );
    });

    it('should reject future timestamp', async function () {
      const { proof, publicSignals } = euIdTestData;
      const date = new Date();
      date.setDate(date.getDate() + 3);
      const [yy, mm, dd] = [
        date.getFullYear().toString().slice(-2),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ];
      const dateMap = { 11: yy[0], 12: yy[1], 13: mm[0], 14: mm[1], 15: dd[0], 16: dd[1] };
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals: publicSignals.map((sig, i) => dateMap[i] ?? sig),
          userContextData: validUserContext,
        },
        500,
        ['Circuit timestamp is in the future'],
      );
    });

    it('should reject old timestamp', async function () {
      const { proof, publicSignals } = euIdTestData;
      const date = new Date();
      date.setDate(date.getDate() - 3);
      const [yy, mm, dd] = [
        date.getFullYear().toString().slice(-2),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
      ];
      const dateMap = { 11: yy[0], 12: yy[1], 13: mm[0], 14: mm[1], 15: dd[0], 16: dd[1] };
      await runTest(
        {
          attestationId: 2,
          proof,
          publicSignals: publicSignals.map((sig, i) => dateMap[i] ?? sig),
          userContextData: validUserContext,
        },
        500,
        ['Circuit timestamp is too old'],
      );
    });
  });
});

describe('Self SDK Aadhaar API Comparison Tests', function () {
  this.timeout(0);

  let aadhaarProof: any;
  let validUserContext: string;

  before(async () => {
    await setupTestDataAadhaar();
    aadhaarProof = getProof();
    validUserContext = getUserContextData();
  });

  it('should verify valid Aadhaar proof successfully', async function () {
    const { proof, publicSignals } = aadhaarProof;
    await runTest(
      {
        attestationId: 3,
        proof,
        publicSignals,
        userContextData: validUserContext,
      },
      200,
    );
  });

  it('should reject invalid user context', async function () {
    const { proof, publicSignals } = aadhaarProof;
    await runTest(
      {
        attestationId: 3,
        proof,
        publicSignals,
        userContextData: getInvalidUserContextData(),
      },
      500,
      ['context hash does not match', 'circuit'],
    );
  });

  it('should reject invalid scope', async function () {
    const { proof, publicSignals } = aadhaarProof;
    await runTest(
      {
        attestationId: 3,
        proof,
        publicSignals: publicSignals.map((sig, i) =>
          i === 17
            ? '17121382998761176299335602807450250650083579600718579431641003529012841023067'
            : sig,
        ),
        userContextData: validUserContext,
      },
      500,
      ['Scope'],
    );
  });

  it('should reject invalid merkle root', async function () {
    const { proof, publicSignals } = aadhaarProof;
    await runTest(
      {
        attestationId: 3,
        proof,
        publicSignals: publicSignals.map((sig, i) =>
          i === 16
            ? '9656656992379025128519272376477139373854042233370909906627112932049610896732'
            : sig,
        ),
        userContextData: validUserContext,
      },
      500,
      ['Onchain root'],
    );
  });

  it('should reject attestation ID mismatch', async function () {
    const { proof, publicSignals } = aadhaarProof;
    await runTest(
      {
        attestationId: 3,
        proof,
        publicSignals: publicSignals.map((sig, i) => (i === 10 ? '1' : sig)),
        userContextData: validUserContext,
      },
      500,
      ['Attestation ID', 'does not match', 'circuit'],
    );
  });

  it('should reject minimum age mismatch', async function () {
    const { proof, publicSignals } = aadhaarProof;
    const bytes = getRevealedDataBytes(3, publicSignals);
    bytes[118] = 25;
    await runTest(
      {
        attestationId: 3,
        proof,
        publicSignals: [
          ...publicSignals.slice(0, 2),
          ...packBytesArray(bytes).map(p => p.toString()),
          ...publicSignals.slice(6),
        ],
        userContextData: validUserContext,
      },
      500,
      ['Minimum age', 'does not match'],
    );
  });

  it('should reject ConfigID not found', async function () {
    const { proof, publicSignals } = aadhaarProof;
    await runTest(
      {
        attestationId: 3,
        proof,
        publicSignals,
        userContextData: validUserContext.slice(0, -1) + '7',
      },
      500,
      ['Config Id not found'],
    );
  });
});

/**
 * Public Signals Structure & Indices
 *
 * The public signals array has a well-defined structure with specific indices
 * for different data types. There are two main attestation types:
 *
 * Attestation ID 1 (Passport):
 *   - Revealed Data Packed: Indices 0-2 (3 signals, 31 bytes each = 93 bytes total)
 *   - Forbidden Countries List Packed: Indices 3-6 (4 signals)
 *   - Nullifier: Index 7
 *   - Attestation ID: Index 8
 *   - Merkle Root: Index 9
 *   - Current Date: Indices 10-15 (6 signals for YYMMDD format)
 *   - Passport Number SMT Root: Index 16
 *   - Name+DOB SMT Root: Index 17
 *   - Name+YOB SMT Root: Index 18
 *   - Scope: Index 19
 *   - User Identifier: Index 20
 *
 * Attestation ID 2 (EU Card):
 *   - Revealed Data Packed: Indices 0-3 (4 signals, 31+31+31+1 bytes = 94 bytes total)
 *   - Forbidden Countries List Packed: Indices 4-7 (4 signals)
 *   - Nullifier: Index 8
 *   - Attestation ID: Index 9
 *   - Merkle Root: Index 10
 *   - Current Date: Indices 11-16 (6 signals for YYMMDD format)
 *   - Passport Number SMT Root: Index 99 (disabled)
 *   - Name+DOB SMT Root: Index 17
 *   - Name+YOB SMT Root: Index 18
 *   - Scope: Index 19
 *   - User Identifier: Index 20
 */

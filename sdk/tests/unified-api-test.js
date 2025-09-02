#!/usr/bin/env node

// Unified API test script for comparing TypeScript and Go API responses
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TS_API_URL = "http://localhost:3000";
const GO_API_URL = "http://localhost:8080";
const VERIFY_ENDPOINT = "/api/verify";

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

// Test case structure
class TestCase {
    constructor(name, requestBody, expectedStatus = 200, expectedResult = true, expectedErrorMessage = null) {
        this.name = name;
        this.requestBody = requestBody;
        this.expectedStatus = expectedStatus;
        this.expectedResult = expectedResult;
        this.expectedErrorMessage = expectedErrorMessage;
    }
}

// API response comparison utility
class APIComparison {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async makeAPICall(url, endpoint, requestBody) {
        const fullUrl = `${url}${endpoint}`;

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();
            let responseData;

            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = { rawResponse: responseText };
            }

            return {
                status: response.status,
                data: responseData,
                success: true
            };
        } catch (error) {
            return {
                status: 0,
                data: { error: error.message },
                success: false,
                error: error.message
            };
        }
    }

    async runTest(testCase) {
        console.log(colorize(`\n🧪 Running test: ${testCase.name}`, 'cyan'));
        console.log(colorize('=' + '='.repeat(50 + testCase.name.length), 'cyan'));

        // Make calls to both APIs
        console.log(colorize('\n📡 Making API calls...', 'blue'));

        const [tsResponse, goResponse] = await Promise.all([
            this.makeAPICall(TS_API_URL, VERIFY_ENDPOINT, testCase.requestBody),
            this.makeAPICall(GO_API_URL, VERIFY_ENDPOINT, testCase.requestBody)
        ]);

        // Display responses
        console.log(colorize('\n📊 TypeScript API Response:', 'magenta'));
        console.log(`Status: ${tsResponse.status}`);
        console.log(`Success: ${tsResponse.success}`);
        if (tsResponse.error) {
            console.log(colorize(`Error: ${tsResponse.error}`, 'red'));
        } else {
            console.log(JSON.stringify(tsResponse.data, null, 2));
        }

        console.log(colorize('\n📊 Go API Response:', 'magenta'));
        console.log(`Status: ${goResponse.status}`);
        console.log(`Success: ${goResponse.success}`);
        if (goResponse.error) {
            console.log(colorize(`Error: ${goResponse.error}`, 'red'));
        } else {
            console.log(JSON.stringify(goResponse.data, null, 2));
        }

        // Compare responses
        const comparison = this.compareResponses(testCase, tsResponse, goResponse);

        // Record results
        if (comparison.passed) {
            this.results.passed++;
            console.log(colorize('\n✅ Test PASSED', 'green'));
        } else {
            this.results.failed++;
            console.log(colorize('\n❌ Test FAILED', 'red'));
        }

        // Display comparison details
        console.log(colorize('\n🔍 Comparison Results:', 'yellow'));
        comparison.details.forEach(detail => {
            const color = detail.passed ? 'green' : 'red';
            const symbol = detail.passed ? '✓' : '✗';
            console.log(colorize(`  ${symbol} ${detail.message}`, color));
        });

        this.results.tests.push({
            name: testCase.name,
            passed: comparison.passed,
            details: comparison.details,
            tsResponse,
            goResponse
        });

        return comparison;
    }

    compareResponses(testCase, tsResponse, goResponse) {
        const details = [];
        let passed = true;

        // Check if both APIs are reachable
        if (!tsResponse.success && !goResponse.success) {
            details.push({
                passed: false,
                message: 'Both APIs are unreachable - make sure Docker services are running'
            });
            return { passed: false, details };
        }

        if (!tsResponse.success) {
            details.push({
                passed: false,
                message: `TypeScript API unreachable: ${tsResponse.error}`
            });
            passed = false;
        }

        if (!goResponse.success) {
            details.push({
                passed: false,
                message: `Go API unreachable: ${goResponse.error}`
            });
            passed = false;
        }

        if (!tsResponse.success || !goResponse.success) {
            return { passed, details };
        }

        // Compare HTTP status codes
        if (tsResponse.status === goResponse.status) {
            details.push({
                passed: true,
                message: `Status codes match: ${tsResponse.status}`
            });
        } else {
            details.push({
                passed: false,
                message: `Status codes differ - TS: ${tsResponse.status}, Go: ${goResponse.status}`
            });
            passed = false;
        }

        // Check expected status
        if (tsResponse.status === testCase.expectedStatus && goResponse.status === testCase.expectedStatus) {
            details.push({
                passed: true,
                message: `Both APIs returned expected status: ${testCase.expectedStatus}`
            });
        } else {
            details.push({
                passed: false,
                message: `Expected status ${testCase.expectedStatus}, got TS: ${tsResponse.status}, Go: ${goResponse.status}`
            });
            passed = false;
        }

        // Compare result field (if present)
        const tsResult = tsResponse.data?.result;
        const goResult = goResponse.data?.result;

        if (tsResult !== undefined && goResult !== undefined) {
            if (tsResult === goResult) {
                details.push({
                    passed: true,
                    message: `Result fields match: ${tsResult}`
                });
            } else {
                details.push({
                    passed: false,
                    message: `Result fields differ - TS: ${tsResult}, Go: ${goResult}`
                });
                passed = false;
            }

            // Check expected result
            if (tsResult === testCase.expectedResult && goResult === testCase.expectedResult) {
                details.push({
                    passed: true,
                    message: `Both APIs returned expected result: ${testCase.expectedResult}`
                });
            } else {
                details.push({
                    passed: false,
                    message: `Expected result ${testCase.expectedResult}, got TS: ${tsResult}, Go: ${goResult}`
                });
                passed = false;
            }
        }

        // Compare error messages (if expected)
        if (testCase.expectedErrorMessage) {
            const tsMessage = tsResponse.data?.message || tsResponse.data?.error;
            const goMessage = goResponse.data?.message || goResponse.data?.error;

            if (tsMessage && goMessage) {
                // Check if both contain the expected error message
                const tsContainsExpected = tsMessage.toLowerCase().includes(testCase.expectedErrorMessage.toLowerCase());
                const goContainsExpected = goMessage.toLowerCase().includes(testCase.expectedErrorMessage.toLowerCase());

                if (tsContainsExpected && goContainsExpected) {
                    details.push({
                        passed: true,
                        message: `Both APIs returned expected error message containing: "${testCase.expectedErrorMessage}"`
                    });
                } else {
                    details.push({
                        passed: false,
                        message: `Error messages don't match expected. TS: "${tsMessage}", Go: "${goMessage}", Expected: "${testCase.expectedErrorMessage}"`
                    });
                    passed = false;
                }
            }
        }

        // Compare response structure similarity
        const tsKeys = Object.keys(tsResponse.data || {}).sort();
        const goKeys = Object.keys(goResponse.data || {}).sort();

        if (JSON.stringify(tsKeys) === JSON.stringify(goKeys)) {
            details.push({
                passed: true,
                message: `Response structures match (same fields)`
            });
        } else {
            details.push({
                passed: false,
                message: `Response structures differ - TS fields: [${tsKeys.join(', ')}], Go fields: [${goKeys.join(', ')}]`
            });
            // This is a warning, not a failure
        }

        return { passed, details };
    }

    printSummary() {
        console.log(colorize('\n' + '='.repeat(60), 'cyan'));
        console.log(colorize('📋 TEST SUMMARY', 'cyan'));
        console.log(colorize('='.repeat(60), 'cyan'));

        const total = this.results.passed + this.results.failed;
        console.log(`\n📊 Total Tests: ${total}`);
        console.log(colorize(`✅ Passed: ${this.results.passed}`, 'green'));
        console.log(colorize(`❌ Failed: ${this.results.failed}`, 'red'));

        if (this.results.failed === 0) {
            console.log(colorize('\n🎉 All tests passed! Both APIs are responding consistently.', 'green'));
        } else {
            console.log(colorize('\n⚠️  Some tests failed. Check the details above.', 'yellow'));
        }

        // Show failed tests
        if (this.results.failed > 0) {
            console.log(colorize('\n❌ Failed Tests:', 'red'));
            this.results.tests.filter(t => !t.passed).forEach(test => {
                console.log(colorize(`  • ${test.name}`, 'red'));
            });
        }
    }
}

// Load test data
function loadTestData() {
    try {
        const proofDataPath = path.join(__dirname, 'ts-api', 'vc_and_disclose_proof.json');
        const proofData = JSON.parse(fs.readFileSync(proofDataPath, 'utf8'));
        return proofData;
    } catch (error) {
        console.error(colorize(`❌ Error loading test data: ${error.message}`, 'red'));
        process.exit(1);
    }
}

// Create test cases
function createTestCases() {
    const proofData = loadTestData();

    // Valid userContextData from working test
    const validUserContextData = "000000000000000000000000000000000000000000000000000000000000a4ec00000000000000000000000094ba0db8a9db66979905784a9d6b2d286e55bd27";

    // Create invalid userContextData by modifying the userIdentifier part (bytes 64-128)
    // Original: "00000000000000000000000094ba0db8a9db66979905784a9d6b2d286e55bd27"
    // Modified: "00000000000000000000000094ba0db8a9db66979905784a9d6b2d286e55bd28" (changed last byte)
    const invalidUserContextData = "000000000000000000000000000000000000000000000000000000000000a4ec00000000000000000000000094ba0db8a9db66979905784a9d6b2d286e55bd28";

    // Create modified publicSignals for different error scenarios
    const invalidScopeSignals = [...proofData.publicSignals];
    invalidScopeSignals[19] = "17121382998761176299335602807450250650083579600718579431641003529012841023067"; // Changed scope (index 19)

    const invalidMerkleRootSignals = [...proofData.publicSignals];
    invalidMerkleRootSignals[9] = "9656656992379025128519272376477139373854042233370909906627112932049610896732"; // Changed merkle root (index 9)

    const invalidAttestationIdSignals = [...proofData.publicSignals];
    invalidAttestationIdSignals[8] = "2"; // Changed attestation ID from "1" to "2" (index 8)

    const testCases = [
        new TestCase(
            'Valid Proof Verification',
            {
                attestationId: 1,
                proof: proofData.proof,
                publicSignals: proofData.publicSignals,
                userContextData: validUserContextData
            },
            200,
            true
        ),
        new TestCase(
            'UserContextHash Mismatch Should Fail',
            {
                attestationId: 1,
                proof: proofData.proof,
                publicSignals: proofData.publicSignals,
                userContextData: invalidUserContextData
            },
            500,
            false,
            "User context hash does not match"
        ),
        new TestCase(
            'Invalid Scope Should Fail',
            {
                attestationId: 1,
                proof: proofData.proof,
                publicSignals: invalidScopeSignals,
                userContextData: validUserContextData
            },
            500,
            false,
            "Scope does not match"
        ),
        new TestCase(
            'Invalid Merkle Root Should Fail',
            {
                attestationId: 1,
                proof: proofData.proof,
                publicSignals: invalidMerkleRootSignals,
                userContextData: validUserContextData
            },
            500,
            false,
            "root does not exist"
        ),
        new TestCase(
            'Invalid Attestation ID Should Fail',
            {
                attestationId: 1,
                proof: proofData.proof,
                publicSignals: invalidAttestationIdSignals,
                userContextData: validUserContextData
            },
            500,
            false,
            "Attestation ID does not match"
        )
    ];

    return testCases;
}

// Check if APIs are running
async function checkAPIHealth() {
    console.log(colorize('🔍 Checking API health...', 'blue'));

    const healthChecks = await Promise.all([
        fetch(`${TS_API_URL}/health`).then(r => ({ api: 'TypeScript', status: r.status, ok: r.ok })).catch(e => ({ api: 'TypeScript', error: e.message, ok: false })),
        fetch(`${GO_API_URL}/health`).then(r => ({ api: 'Go', status: r.status, ok: r.ok })).catch(e => ({ api: 'Go', error: e.message, ok: false }))
    ]);

    let allHealthy = true;
    healthChecks.forEach(check => {
        if (check.ok) {
            console.log(colorize(`✅ ${check.api} API is healthy (${check.status})`, 'green'));
        } else {
            console.log(colorize(`❌ ${check.api} API is not responding: ${check.error || check.status}`, 'red'));
            allHealthy = false;
        }
    });

    if (!allHealthy) {
        console.log(colorize('\n⚠️  Some APIs are not responding. Make sure Docker services are running:', 'yellow'));
        console.log('   cd sdk/tests && ./run-apis.sh up');
        console.log('');
        console.log('Continuing with tests anyway...');
    }

    return allHealthy;
}

// Main execution
async function main() {
    console.log(colorize('🚀 Self SDK Unified API Test Suite', 'cyan'));
    console.log(colorize('=====================================', 'cyan'));

    // Check API health
    await checkAPIHealth();

    // Create test runner
    const comparison = new APIComparison();

    // Create and run test cases
    const testCases = createTestCases();

    console.log(colorize(`\n📋 Running ${testCases.length} test case(s)...`, 'blue'));

    for (const testCase of testCases) {
        await comparison.runTest(testCase);
    }

    // Print summary
    comparison.printSummary();

    // Exit with appropriate code
    process.exit(comparison.results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error(colorize('\n💥 Unhandled error:', 'red'), error);
    process.exit(1);
});

// Run the tests
main().catch(error => {
    console.error(colorize('\n💥 Fatal error:', 'red'), error);
    process.exit(1);
});

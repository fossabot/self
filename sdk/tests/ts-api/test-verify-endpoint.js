#!/usr/bin/env node

// Test script for the verify endpoint with real proof data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the proof data from JSON file
const proofData = JSON.parse(fs.readFileSync(path.join(__dirname, 'vc_and_disclose_proof.json'), 'utf8'));

const API_URL = "http://localhost:3000";
const endpoint = `${API_URL}/api/verify`;


const requestBody = {
    attestationId: 1,
    proof: proofData.proof,
    publicSignals: proofData.publicSignals,
    userContextData: "000000000000000000000000000000000000000000000000000000000000a4ec00000000000000000000000094ba0db8a9db66979905784a9d6b2d286e55bd27"
};

console.log('🧪 Testing verify endpoint with real proof data...');
console.log('📋 Request body:');
console.log(JSON.stringify(requestBody, null, 2));
console.log('\n🚀 Sending request to:', endpoint);

// Make the API call
fetch(endpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
})
.then(async response => {
    const status = response.status;
    const responseText = await response.text();

    console.log(`\n📊 Response Status: ${status}`);
    console.log('📄 Response Body:');

    try {
        const jsonResponse = JSON.parse(responseText);
        console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
        console.log(responseText);
    }

    if (status === 200) {
        console.log('\n✅ Verification succeeded!');
    } else {
        console.log('\n❌ Verification failed');
    }
})
.catch(error => {
    console.error('\n💥 Error making request:', error.message);
    console.log('\nMake sure the server is running on port 3000');
    console.log('You can start it with: npm start or yarn start');
});

# TypeScript API for SelfBackendVerifier Testing

This is a TypeScript API server that provides endpoints for testing the SelfBackendVerifier functionality.

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Build the project:
```bash
yarn build
```

3. Start the server:
```bash
yarn start
```

Or for development with hot reload:
```bash
yarn dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Save Options
```
POST /api/save-options
Content-Type: application/json

{
  "userId": "user123",
  "options": {
    "minimumAge": 18,
    "ofac": true,
    "excludedCountries": ["Country1", "Country2"],
    "issuing_state": true,
    "name": true,
    "nationality": true,
    "date_of_birth": false,
    "passport_number": false,
    "gender": true,
    "expiry_date": true
  }
}
```

### Verify Attestation
```
POST /api/verify
Content-Type: application/json

{
  "attestationId": 1,
  "proof": {
    "a": ["...", "..."],
    "b": [["...", "..."], ["...", "..."]],
    "c": ["...", "..."]
  },
  "publicSignals": ["...", "...", "..."],
  "userContextData": "..."
}
```

## Storage

This API uses in-memory storage for testing purposes:
- Options are stored with 30-minute expiration
- Configuration data is stored in memory
- Data is lost when server restarts

## Environment

- Default port: 3000
- Node.js version: 22.x
- TypeScript with ES modules

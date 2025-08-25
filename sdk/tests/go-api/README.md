# Go API for SelfBackendVerifier Testing

This is a Go API server that provides endpoints for testing the SelfBackendVerifier functionality, equivalent to the TypeScript API version.

## Setup

1. Initialize Go module dependencies:
```bash
go mod tidy
```

2. Build the project:
```bash
go build -o go-api
```

3. Run the server:
```bash
./go-api
```

Or run directly with Go:
```bash
go run main.go
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

## Features

- **In-memory storage**: Options stored with 30-minute expiration
- **CORS enabled**: Supports cross-origin requests
- **Error handling**: Comprehensive error responses
- **Health monitoring**: Built-in health check endpoint
- **Self SDK integration**: Uses Go SDK for verification

## Configuration

### Environment Variables

- `PORT`: Server port (default: 8080)

### Storage

This API uses in-memory storage for testing purposes:
- Options are stored with 30-minute expiration
- Configuration data is stored in memory
- Data is lost when server restarts

## Project Structure

```
go-api/
├── api/
│   ├── save-options.go    # Save options endpoint handler
│   └── verify.go          # Verification endpoint handler
├── config/
│   └── config.go          # In-memory storage and configuration
├── main.go                # HTTP server setup and routing
├── go.mod                 # Go module dependencies
└── README.md              # This file
```

## Dependencies

- **Self Go SDK**: Local SDK for verification logic
- **Ethereum Go**: Blockchain interaction (via SDK)
- **Standard library**: HTTP server, JSON, context handling

## Development

### Build
```bash
go build -o go-api
```

### Run with auto-reload
```bash
# Install air for hot reloading
go install github.com/cosmtrek/air@latest

# Run with hot reload
air
```

### Test endpoints
```bash
# Health check
curl http://localhost:8080/health

# Save options
curl -X POST http://localhost:8080/api/save-options \
  -H "Content-Type: application/json" \
  -d '{"userId":"test123","options":{"minimumAge":21}}'

# Test verification (with mock data)
curl -X POST http://localhost:8080/api/verify \
  -H "Content-Type: application/json" \
  -d '{"attestationId":1,"proof":{},"publicSignals":[],"userContextData":""}'
```

## Comparison with TypeScript API

This Go API provides identical functionality to the TypeScript version:

- **Same endpoints**: `/health`, `/api/save-options`, `/api/verify`
- **Same request/response formats**: JSON API compatibility
- **Same storage behavior**: 30-minute expiration for options
- **Same error handling**: HTTP status codes and messages
- **Same verification logic**: Uses Self protocol SDK

## Environment

- Default port: 8080 (vs 3000 for TypeScript)
- Go version: 1.23+
- In-memory storage with TTL
- CORS-enabled for browser compatibility

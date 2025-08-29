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

- **CORS enabled**: Supports cross-origin requests
- **Error handling**: Comprehensive error responses
- **Health monitoring**: Built-in health check endpoint
- **Self SDK integration**: Uses Go SDK for verification
- **Default configuration**: Hard-coded verification settings matching TypeScript API

## Configuration

### Environment Variables

- `PORT`: Server port (default: 8080)

### Storage

This API uses in-memory storage for testing purposes:
- Verification configuration is hard-coded (minimum age: 18, excludes PAK/IRN, OFAC enabled)
- Configuration data is stored in memory
- Data is lost when server restarts

## Project Structure

```
go-api/
├── api/
│   └── verify.go          # Verification endpoint handler
├── config/
│   └── config.go          # In-memory storage and configuration
├── main.go                # HTTP server setup and routing
├── test-verify-endpoint.go  # Test script for verification endpoint
├── run-test.sh           # Shell script to run tests
├── go.mod                 # Go module dependencies
├── Makefile              # Build and test commands
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

# Test verification (with real proof data)
make test
# or
./run-test.sh
# or manually build and run
go run test-verify-endpoint.go
```

## Comparison with TypeScript API

This Go API provides identical functionality to the TypeScript version:

- **Same endpoints**: `/health`, `/api/verify`
- **Same request/response formats**: JSON API compatibility
- **Same verification configuration**: Hard-coded settings (age 18+, exclude PAK/IRN, OFAC enabled)
- **Same error handling**: HTTP status codes and messages
- **Same verification logic**: Uses Self protocol SDK

## Docker Setup

### Building and Running with Docker

**Option 1: Using the build script (Recommended)**
```bash
# From the monorepo root directory
./sdk/tests/go-api/docker-build.sh

# Run the container
docker run -p 8080:8080 selfxyz-go-api:latest
```

**Option 2: Manual Docker build**
```bash
# From the monorepo root directory
docker build -f sdk/tests/go-api/Dockerfile -t selfxyz-go-api:latest .

# Run the container
docker run -p 8080:8080 selfxyz-go-api:latest
```

**Option 3: Using Docker Compose**
```bash
# From the go-api directory
cd sdk/tests/go-api
docker-compose up --build
```

The Docker container includes:
- Health check endpoint at `/health`
- Automatic restart policy
- Non-root user for security
- Production optimizations
- Multi-stage build for minimal image size

### Docker Environment Variables

- `PORT`: Server port (default: 8080)

## Development vs Docker

### Local Development
```bash
go run main.go      # Direct Go execution
go build && ./go-api  # Compiled binary
```

### Docker Production
```bash
go build -o go-api  # Compiles Go binary
./go-api            # Runs compiled binary
```

## Testing

### API Testing Script
```bash
# Test the running API with real proof data
make test
# or directly
./run-test.sh
# or manually
go run test-verify-endpoint.go
```

The test script:
- Uses real proof data from `vc_and_disclose_proof.json`
- Tests the complete verification flow
- Provides detailed output and error handling
- Automatically handles JSON parsing and pretty printing

## Environment

- Default port: 8080 (vs 3000 for TypeScript)
- Go version: 1.23+
- In-memory storage with TTL
- CORS-enabled for browser compatibility
- Docker support with multi-stage builds

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Self is an identity wallet that uses zk-SNARKs to generate privacy-preserving proofs from government-issued IDs (passports, ID cards). Users scan NFC chips to prove validity while revealing only specific attributes (age, nationality, humanity).

## Monorepo Structure

This is a Yarn workspaces monorepo with these main packages:

- **`app/`** - React Native mobile app (iOS/Android) with web support via Vite
- **`circuits/`** - Zero-knowledge proof circuits written in Circom
- **`contracts/`** - Solidity smart contracts for on-chain verification
- **`common/`** - Shared utilities, constants, and types
- **`sdk/`** - SDKs for integration (core, qrcode)

## Development Commands

### Root Level
- `yarn install` - Bootstrap dependencies and setup husky hooks
- `yarn build` - Build all workspaces in topological order
- `yarn lint` - Run linting across all workspaces
- `yarn format` - Format code across all workspaces
- `yarn types` - Run TypeScript checks across workspaces

### Mobile App (`app/`)
- `yarn start` - Start Metro bundler for React Native
- `yarn android` - Run on Android
- `yarn ios` - Run on iOS
- `yarn web` - Start Vite dev server for web
- `yarn test` - Run Jest tests
- `yarn types` - TypeScript type checking
- `yarn lint` / `yarn lint:fix` - ESLint
- `yarn fmt` - Check code formatting (Prettier)
- `yarn fmt:fix` - Fix code formatting issues
- `yarn setup` - Full setup including pods and dependencies
- `yarn reinstall` - Clean reinstall everything

### Circuits (`circuits/`)
- `yarn test` - Run all circuit tests with Mocha
- `yarn test-register` - Test registration circuits
- `yarn test-dsc` - Test DSC verification circuits
- `yarn test-disclose` - Test disclosure circuits
- `yarn build-all` - Build all circuit types
- `yarn download` - Download pre-built circuits from AWS

### Contracts (`contracts/`)
- `yarn build` - Compile Solidity contracts with Hardhat
- `yarn test` - Run contract tests
- `yarn test:local` - Run tests with local environment
- `yarn deploy:verifiers` - Deploy circuit verifiers
- `yarn deploy:registry` - Deploy identity registry
- `yarn deploy:hub:v2` - Deploy verification hub

### Common (`common/`)
- `yarn build` - Build both ESM and CJS distributions
- `yarn test` - Run utility tests

## Architecture Patterns

### Mobile App Architecture
- **State Management**: Zustand stores (`stores/`) for global state
- **Navigation**: React Navigation with route definitions in `navigation/`
- **Platform Separation**: `.web.ts`/`.tsx` files for web-specific implementations
- **Providers**: Context providers for auth, database, passport data
- **Proving Flow**: XState machines for complex proof generation workflows

### Circuit Architecture
- **Modular Design**: Separate circuits for register, disclose, DSC verification
- **Instance Generation**: Multiple algorithm-specific circuit instances
- **Test Coverage**: Comprehensive test suite for each circuit type
- **Utility Circuits**: Reusable components for cryptographic operations

### Contract Architecture
- **Upgradeable Contracts**: Using OpenZeppelin upgradeable pattern
- **Registry Pattern**: Central registry for identity commitments
- **Verification Hub**: Orchestrates different proof types
- **Circuit Verifiers**: Generated Solidity verifiers for each circuit

### Key Components
- **Passport Reading**: NFC scanning with platform-specific native modules
- **Proof Generation**: Browser/mobile-compatible proving using Web Workers
- **ZK Circuits**: Support for multiple hash algorithms and signature schemes
- **State Machines**: XState for complex async workflows like proving

## Testing

### Running Tests
- Mobile: `yarn test` (Jest with React Native Testing Library)
- Circuits: `yarn test` (Mocha with circom_tester)
- Contracts: `yarn test` (Hardhat with Chai)

### Test Organization
- Integration tests in `test/integration/`
- Unit tests alongside source files or in `test/unit/`
- Mock data and utilities in `test/utils/` or `__setup__/`

## Key Files to Understand

- `app/src/stores/selfAppStore.tsx` - WebSocket communication with verification backend
- `app/src/utils/proving/provingMachine.ts` - XState machine for proof generation
- `circuits/circuits/register/register.circom` - Core registration circuit
- `contracts/contracts/IdentityVerificationHubImplV2.sol` - Main verification contract
- `common/src/utils/passportData.ts` - Passport data parsing utilities

## Development Notes

- Use `yarn` (v4.6.0) as package manager
- Gitleaks runs on commit to prevent secrets
- Platform-specific code uses `.web.ts` suffix for web implementations
- Circuit compilation requires significant memory (8GB+ recommended)
- Mobile development requires iOS/Android SDKs and simulators/devices

## Code Formatting & CI

**IMPORTANT**: CI will fail if code formatting is incorrect. Always run formatting before committing:

### App-specific formatting:
```bash
cd app && yarn fmt:fix  # Fix formatting in app workspace
cd app && yarn fmt     # Check formatting passes
```

### Root-level formatting:
```bash
yarn format  # Format all workspaces
```

**Note**: The app workspace uses `yarn fmt`/`yarn fmt:fix` while root uses `yarn format`. Both must pass for CI to succeed.

## Linting

The codebase uses ESLint for code quality checks. Run linting before commits:

### Root-level linting:
```bash
yarn lint  # Lint all workspaces (warnings allowed, errors will fail CI)
```

**Note**: ESLint warnings are allowed and will not fail CI, but errors will. The lint output includes warnings for console statements and TypeScript `any` types which are acceptable in development code.

## CI/CD Requirements

The project uses GitHub Actions with multiple workflows for different components. All checks must pass for PRs to be merged.

### CI Workflows Overview

#### General Checks (`general-checks.yml`)
Runs on all pull requests:
- **Lint**: `yarn lint` - ESLint checks across all workspaces
- **Type Check**: `yarn types` - TypeScript type checking across workspaces  
- **Common Tests**: `yarn workspace @selfxyz/common test` - Tests for shared utilities

#### App CI (`app.yml`)
Runs when `app/` or `common/` files change:
- **Lint**: `yarn lint` in app workspace
- **Format**: `yarn fmt` in app workspace (Prettier check)
- **Test**: `yarn test` after building dependencies
- **Build**: Full iOS/Android build with Xcode 16.2

#### Circuits CI (`circuits.yml`)
Runs when `circuits/` or `common/` files change:
- **Lint**: `yarn workspace @selfxyz/circuits lint`
- **Test**: Circuit tests with Circom 2.1.9 and specialized dependencies

#### Contracts CI (`contracts.yml`)
Runs when `contracts/` or `common/` files change:
- **Format**: `yarn prettier:check` in contracts workspace
- **Build**: `yarn build` after building common dependencies
- **Test**: Currently disabled (`if: false`)

#### Security Scans
Run on all pull requests:
- **Gitleaks**: Secret detection using `.gitleaks.toml` configuration
- **GitGuardian**: Additional secret scanning service

### Key CI Commands

To ensure CI passes, run these commands before committing:

```bash
# Root level - runs across all workspaces
yarn lint          # ESLint (warnings OK, errors fail CI)
yarn types         # TypeScript type checking
yarn format        # Prettier formatting

# App workspace specific
cd app
yarn lint          # App-specific ESLint
yarn fmt           # App-specific Prettier check
yarn test          # Jest tests
yarn build:deps    # Build dependencies

# Circuits workspace
yarn workspace @selfxyz/circuits lint
yarn workspace @selfxyz/circuits test

# Contracts workspace
cd contracts
yarn prettier:check
yarn build
```

### Pre-commit Setup

The project uses Husky for pre-commit hooks:
- **Gitleaks**: `yarn gitleaks` - Prevents committing secrets
- Configured via `yarn prepare` during installation

### Environment Requirements

Different workspaces have specific environment needs:
- **Node.js**: 18.x for most workspaces, 20.x for contracts
- **Ruby**: 3.2 for mobile builds
- **Java**: 17 for Android builds  
- **Xcode**: 16.2 for iOS builds
- **Circom**: 2.1.9 for circuit compilation
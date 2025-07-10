# Mobile Deployment Workflow Improvements Plan

## Overview
Streamline the mobile deployment workflow to eliminate manual steps, support targeted testing groups, and enable fully automated deployments based on branch merges.

## Current Pain Points
1. Manual version/build number entry
2. Android requires manual download from Slack and upload to Play Store
3. Cannot query current Play Store version due to permissions
4. No support for targeted external testing groups
5. iOS build artifacts cleanup may not be working
6. Overall process is clunky and error-prone

## Proposed Improvements

### 1. **Automated Version Management**

#### Auto-increment Logic
- `dev` branch: Increment build number only
- `main` branch: Increment patch version + build number
- Manual trigger: Allow major/minor version bumps

#### Implementation Details
- Create `app/version.json` to track current version state
- Update package.json automatically
- Sync with native project files (Info.plist, build.gradle)
- Use git tags for version tracking

#### Version File Structure
```json
{
  "version": "2.5.5",
  "ios": { 
    "build": 145, 
    "lastDeployed": "2024-01-10T12:00:00Z" 
  },
  "android": { 
    "build": 145, 
    "lastDeployed": "2024-01-10T12:00:00Z" 
  }
}
```

This simplified structure tracks only the essential information needed for version management. Full deployment history is maintained through git tags and CI/CD logs.

### 2. **Branch-based Automation**

#### Workflow Triggers
- **Push to `dev`**: 
  - iOS → TestFlight Internal Testing
  - Android → Play Store Internal Track
  - Auto-increment build number
  
- **Push to `main`**:
  - iOS → App Store (Ready for Sale)
  - Android → Play Store Production
  - Auto-increment patch version and build

- **Manual Dispatch**:
  - Select platforms (iOS/Android/Both)
  - Choose deployment track
  - Specify test groups
  - Option for version bump type

#### Workflow Improvements
- Add matrix builds for parallel iOS/Android execution
- Implement proper caching for dependencies (Pods, Gradle)
- Add approval gates for production deployments
- Better error handling and retry logic
- Pre-deployment health checks (app builds, certificates valid, API keys working)

#### Pre-Deployment Health Checks
Before initiating any deployment, the workflow will validate:
- **Certificates & Provisioning**: Check expiration dates, validate signatures
- **API Keys**: Verify App Store Connect and Google Play API access
- **Build Environment**: Ensure all dependencies are available
- **Version Conflicts**: Confirm version numbers are valid and not duplicated
- **Secrets**: Validate all required secrets are present and properly formatted

```yaml
# Example health check implementation
- name: Pre-deployment Health Check
  run: |
    yarn deploy:health-check --platform=${{ matrix.platform }}
    # Checks:
    # - Certificate expiration (> 30 days)
    # - API key validity
    # - Build tools availability
    # - Version number conflicts
    # - Required secrets presence
```

### 3. **Targeted External Testing**

#### Configuration Structure
```yaml
test_groups:
  ios:
    default: ["Internal Testers"]
    nfc_testing: ["NFC Test Group", "QA Team"]
    beta: ["Beta Testers", "External QA"]
  android:
    default: ["internal"]
    nfc_testing: ["nfc-testers", "qa-team"]
    beta: ["beta", "external-qa"]
```

#### Implementation
- **iOS**: Use TestFlight `groups` parameter in Fastlane
- **Android**: Use Play Console tracks or closed testing groups
- Add workflow_dispatch input for group selection
- Environment variable override: `DEPLOYMENT_GROUPS`

### 4. **Google Play Automation Solutions**

#### Option A - Release Manager Role (Recommended)
Grant the service account "Release Manager" role in Google Play Console:
- Provides necessary permissions without full admin access
- Allows querying version codes and managing releases
- Requires 24-48 hour wait for permissions to propagate
- Much safer than "Admin (all permissions)"

Implementation after permissions granted:
```javascript
// With Release Manager role, the service account can:
// - Query current version codes
// - Create and manage releases
// - Upload APKs/AABs to tracks

const { google } = require('googleapis');
const androidpublisher = google.androidpublisher('v3');

async function getCurrentVersion() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'play-store-key.json',
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  });
  
  const authClient = await auth.getClient();
  const res = await androidpublisher.edits.tracks.list({
    auth: authClient,
    packageName: 'com.self.app',
    editId: await createEdit()
  });
  
  return extractLatestVersion(res.data);
}
```

#### Option B - Version.json with API Verification
- Use `app/version.json` as primary source of truth
- After Release Manager permissions granted, add API verification
- Provides immediate solution while waiting for permissions
- Acts as fallback if API is unavailable

### 5. **Enhanced Deployment Confirmation**

#### Features
- Unified status checker for both platforms
- Real-time deployment monitoring via APIs
- Rich Slack notifications with:
  - Platform icons (🍎 iOS, 🤖 Android)
  - Version and build numbers
  - Deployment track/environment
  - Direct store links
  - QR codes for easy testing
  - Time elapsed
  - Success/failure status

#### Notification Template
```
🚀 Deployment Complete

Platform: 🍎 iOS
Version: 2.5.6 (Build 146)
Track: TestFlight Internal
Status: ✅ Success
Duration: 12m 34s
Groups: Internal Testers, NFC Test Group

📱 Install: [TestFlight Link]
📊 Dashboard: [App Store Connect]
```

### 6. **iOS Artifacts Cleanup**

#### Cleanup Tasks
```ruby
# In Fastfile
private_lane :cleanup_ios_artifacts do
  # Remove temporary certificates
  sh "rm -f #{ios_dist_cert_path}"
  sh "rm -f #{ios_prov_profile_path}"
  sh "rm -f #{ios_connect_api_key_path}"
  
  # Clear provisioning profiles
  sh "rm -rf ~/Library/MobileDevice/Provisioning\\ Profiles/*.mobileprovision"
  
  # Delete derived data
  clear_derived_data
  
  # Clean build folders
  sh "rm -rf ./build"
  sh "rm -rf ./ios/build"
  
  # Remove keychain (CI only)
  if is_ci
    sh "security delete-keychain build.keychain || true"
  end
end
```

### 7. **Developer Experience Improvements**

#### New Commands
```bash
# Local development
yarn deploy:ios:local        # Deploy iOS locally with prompts
yarn deploy:android:local    # Deploy Android locally with prompts
yarn deploy:test --group nfc # Deploy to specific test group

# Version management
yarn version:bump:patch      # Bump patch version
yarn version:bump:minor      # Bump minor version
yarn version:bump:major      # Bump major version
yarn version:sync            # Sync versions across platforms

# Status and monitoring
yarn deploy:status           # Check deployment status
yarn deploy:history          # View deployment history
```

#### Improved Error Messages
- Clear, actionable error messages
- Suggestion for fixes
- Links to documentation
- Automatic issue creation for failures

## Implementation Plan

### Phase 1: Core Automation (Week 1)
1. **Day 1-2**: Implement version.json and version management system
2. **Day 3-4**: Update GitHub workflow for branch-based triggers
3. **Day 5**: Add basic deployment confirmation and notifications

### Phase 2: Testing Groups (Week 2)
1. **Day 1-2**: Add test group configuration system
2. **Day 3-4**: Update Fastfile to support dynamic groups
3. **Day 5**: Test with NFC testing scenario

### Phase 3: Google Play Integration (Week 3)
1. **Day 1**: Request Release Manager role for service account
2. **Day 2**: Implement version.json as immediate solution
3. **Day 3-4**: Wait for permissions propagation (24-48 hours)
4. **Day 5**: Enable API verification and complete automation

### Phase 4: Polish and Cleanup (Week 4)
1. **Day 1-2**: Fix iOS artifacts cleanup
2. **Day 3-4**: Enhance notifications and error handling
3. **Day 5**: Documentation and testing

## File Structure Changes

```
app/
├── fastlane/
│   ├── Fastfile (updated)
│   ├── helpers.rb (updated)
│   ├── version_manager.rb (new)
│   └── test_groups.yml (new)
├── scripts/
│   ├── deploy.js (new)
│   ├── version.js (new)
│   └── cleanup.js (updated)
├── version.json (new)
└── .github/
    └── workflows/
        ├── mobile-deploy.yml (updated)
        └── mobile-deploy-manual.yml (new)
```

## Configuration Examples

### GitHub Workflow Dispatch Inputs
```yaml
workflow_dispatch:
  inputs:
    platform:
      description: 'Platform to deploy'
      required: true
      default: 'both'
      type: choice
      options:
        - ios
        - android
        - both
    deployment_track:
      description: 'Deployment track'
      required: true
      default: 'internal'
      type: choice
      options:
        - internal
        - beta
        - production
    test_groups:
      description: 'Test groups (comma-separated)'
      required: false
      default: 'default'
    version_bump:
      description: 'Version bump type'
      required: false
      default: 'build'
      type: choice
      options:
        - build
        - patch
        - minor
        - major
```

### Environment Variables
```bash
# Required
IOS_APP_IDENTIFIER=com.self.app
ANDROID_PACKAGE_NAME=com.self.app

# Testing Groups
IOS_TEST_GROUPS_DEFAULT="Internal Testers"
IOS_TEST_GROUPS_NFC="NFC Test Group,QA Team"
ANDROID_TEST_GROUPS_DEFAULT="internal"
ANDROID_TEST_GROUPS_NFC="nfc-testers,qa-team"

# Deployment Configuration
AUTO_DEPLOY_ON_MERGE=true
REQUIRE_APPROVAL_FOR_PROD=true
CLEANUP_ARTIFACTS_POST_BUILD=true

# Notifications
SLACK_DEPLOYMENT_CHANNEL="#deployments"
ENABLE_DEPLOYMENT_METRICS=true
```

## Success Criteria

1. **Zero Manual Input**: Standard deployments require no manual version entry
2. **Targeted Testing**: Can deploy to specific groups without public release
3. **Full Automation**: Both iOS and Android deploy without manual steps
4. **Clean Codebase**: Well-organized, maintainable deployment code
5. **Robust Error Handling**: Clear errors, automatic retries, and fallbacks
6. **Comprehensive Notifications**: Team stays informed of all deployments
7. **Fast Deployments**: Improved build times through caching and parallelization

## Security Considerations

1. **Secrets Management**:
   - Use GitHub Environments for production secrets
   - Implement secret rotation
   - Audit access logs

2. **Deployment Gates**:
   - Require approval for production
   - Implement rollback mechanism
   - Add deployment windows

3. **Access Control**:
   - Limit who can trigger deployments
   - Use branch protection rules
   - Implement CODEOWNERS for workflow files

## Monitoring and Metrics

1. **Deployment Metrics**:
   - Build duration trends
   - Success/failure rates
   - Deployment frequency
   - Time to production

2. **Alerts**:
   - Failed deployments
   - Unusual deployment patterns
   - Certificate expiration warnings
   - Service degradation

## Rollback Strategy

1. **Immediate Rollback**:
   - Keep previous builds available
   - One-click rollback in Fastlane
   - Automated rollback on critical failures

2. **Version Control**:
   - Tag all deployments
   - Keep deployment history
   - Document rollback procedures

This plan transforms the mobile deployment process from a manual, error-prone workflow to a streamlined, automated system that supports various deployment scenarios while maintaining security and reliability.
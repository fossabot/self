# Mobile Deployment Automation - Team Meeting Questions

## 🔑 Critical Decisions

### 1. **Google Play Permissions**
**Current Situation**: We can't query Play Store versions or fully automate Android deployments due to service account permission limitations.

**Solution Found**: Service account needs "Release Manager" role in Google Play Console (not "Admin/God mode").

**Options**:
- a) Grant "Release Manager" role to service account
   - Allows version querying without excessive permissions
   - Requires 24-48 hour wait for propagation
   - This is the recommended approach
- b) Use version.json as primary tracking with API as verification
   - Implement immediately, add API verification after permissions granted
- c) Keep current manual process as permanent fallback
   - Only if security team rejects Release Manager role

**Question**: Can we grant "Release Manager" role and wait 48 hours for propagation?

### 2. **Version Bumping Policy**
**Current Situation**: Manual version entry is error-prone and slows down deployments.

**Options**:
- a) Auto-increment patch version on main branch merges (2.5.5 → 2.5.6)
   - Fully automated, no developer input needed
- b) Require developers to explicitly bump version before merging
   - More control but adds manual step
- c) Make it configurable per deployment
   - Flexible but more complex

**Question**: What's our preferred balance between automation and version control?

### 3. **Testing Groups Configuration**
**Current Situation**: Seshanth needs NFC testing without public deployment. Others may have similar needs.

**Options**:
- a) Hardcode groups in GitHub workflow
   - Simple but requires PR to change groups
- b) Use a config file (test_groups.yml)
   - Can be updated without changing workflow
- c) Pass groups as parameters each time
   - Most flexible but requires manual input

**Question**: How often do we expect testing groups to change?

### 4. **Android Deployment Flow**
**Current Situation**: Android AAB must be downloaded from Slack and manually uploaded to Play Store.

**Options**:
- a) Keep Slack download as permanent part of the flow
   - Maintains human verification step
- b) Try to fully automate with workarounds
   - Use version.json + minimal API permissions
- c) Make it optional (auto when possible, manual fallback)
   - Best of both worlds but more complex

**Question**: Is the manual step a feature (for safety) or a bug (to be fixed)?

## 📊 Quick Context

### Current Pain Points:
- Manual version/build number entry
- Android requires manual download from Slack and upload to Play Store
- Cannot query current Play Store version due to permissions
- No support for targeted external testing groups
- iOS build artifacts cleanup may not be working
- Overall process is clunky and error-prone

### Proposed Solution:
- Automated versioning with version.json
- Branch-based deployments (dev → internal, main → production)
- Test group support for targeted deployments
- Improved notifications and deployment confirmation

### Timeline:
- Week 1: Core automation and version management
- Week 2: Testing groups implementation
- Week 3: Google Play integration (within constraints)
- Week 4: Polish and cleanup

## 🚀 Immediate Actions (Week 1)

If approved, I can start immediately with:
1. Fix version sync issue (Android 2.5.4 vs iOS/package.json 2.5.5)
2. Re-enable the disabled workflows (currently `if: false`)
3. Remove manual version input requirement
4. Fix TestFlight groups configuration for NFC testing

## ⚠️ Risk & Compliance Questions

1. **Security**: Are there any compliance/security concerns with automating deployments?
2. **Approval Gates**: Do we need manual approval steps for production deployments?
3. **Rollback**: What's our rollback strategy if automated deployment goes wrong?
4. **Access Control**: Who should be able to trigger deployments?

## 📝 Additional Considerations

1. **Monitoring**: Should we add deployment metrics and alerting?
2. **Documentation**: Where should deployment procedures be documented?
3. **Training**: Who needs to be trained on the new workflow?
4. **Migration**: How do we transition from current manual process?

## 🎯 Success Criteria

- Zero manual input for standard deployments
- Targeted testing without public release
- Both iOS and Android fully automated (within permission constraints)
- Clear notifications and deployment status
- Faster deployment times through caching and parallelization

---

**Note**: Please come prepared to discuss which options best fit our team's workflow and security requirements. The implementation details can be adjusted based on these decisions.

## 📚 Research Findings (2025)

### Google Play Console API Permissions (Clarified)
Based on 2025 documentation and Google's guidance:
- **Who Can Grant Access**: Account owner OR users with "Admin" privileges (specifically "Manage users and permissions")
- **Required Role**: "Release Manager" is sufficient (not "Admin all permissions")
- **Permissions Needed**:
  - View app information and download bulk reports
  - Create, edit, and roll out releases to testing tracks
- **API Scope**: `https://www.googleapis.com/auth/androidpublisher` (full scope required, not read-only)
- **Critical**: Wait 24-48 hours after granting permissions for propagation
- **Security**: Release Manager role avoids risks of full admin access (app deletion, data modification)

### TestFlight External Groups (2025)
Current capabilities:
- Support for up to 10,000 external testers
- Groups must be created in App Store Connect before automation
- External builds require App Review approval
- Automation options:
  - App Store Connect API (official)
  - Fastlane/Pilot (add testers via CSV, manage groups)
  - Xcode Cloud (native integration)
- **Limitation**: Can't add test notes during automated publishing

### Mobile Deployment Best Practices (2025)
Industry standards from GitHub and others:
- **Release Cycle**: Weekly automated releases (GitHub's approach)
- **Architecture**: Parallel workflows for build, testing, notes, versioning
- **Security**: Base64 encode certificates, use GitHub secrets
- **Certificate Storage**: Consider Google Cloud Storage for Fastlane Match
- **Release Management**: Rotating "release captain", automated tracking issues
- **Testing**: Automated cherry-pick process for beta fixes

### Staged/Phased Rollouts (2025)
Latest capabilities:
- **iOS**: Still automatic 7-day rollout with fixed percentages
- **Android**: 
  - Manual percentage control remains default
  - **NEW**: Can halt fully live releases via API/Console (I/O 2025)
  - API supports programmatic percentage control
  - Third-party tools (Instabug, Bitrise) offer automated scheduling
- **Google Play API**: Updated as of July 2025 with new halt capabilities
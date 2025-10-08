#!/bin/bash
# SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
# SPDX-License-Identifier: BUSL-1.1
# NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

# Build Android AAR from source using the app's Gradle wrapper

set -e

echo "🤖 Building Android AAR for mobile-sdk-alpha..."

# Navigate to android directory
cd "$(dirname "$0")/../android"

# Check if we're in a monorepo and can use the app's gradlew
APP_GRADLEW="../../../app/android/gradlew"

if [ -f "$APP_GRADLEW" ]; then
    echo "✅ Using app's Gradle wrapper"

    # Check if we need to swap build.gradle files
    if [ -f "build.gradle.source" ]; then
        echo "📝 Swapping to source build.gradle..."
        mv build.gradle build.gradle.prebuilt.tmp
        mv build.gradle.source build.gradle
    fi

    # Build using app's gradlew from the app's android directory
    # This ensures React Native and other dependencies are available
    cd ../../../app/android
    ./gradlew :mobile-sdk-alpha:assembleRelease

    # Restore build.gradle files if we swapped them
    if [ -f "../../packages/mobile-sdk-alpha/android/build.gradle.prebuilt.tmp" ]; then
        echo "📝 Restoring prebuilt build.gradle..."
        cd ../../packages/mobile-sdk-alpha/android
        mv build.gradle build.gradle.source
        mv build.gradle.prebuilt.tmp build.gradle
    fi

    echo "✅ Android AAR built successfully"
    echo "📦 AAR location: packages/mobile-sdk-alpha/dist/android/"
else
    echo "❌ Error: Could not find app's Gradle wrapper at $APP_GRADLEW"
    echo "Please ensure you're running this from the monorepo root or that the app is set up."
    exit 1
fi

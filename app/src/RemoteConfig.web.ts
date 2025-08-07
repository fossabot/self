// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

// Web-compatible version using LocalStorage and Firebase Web SDK
// This file provides the same API as RemoteConfig.ts but for web environments

import type {
  FeatureFlagValue,
  RemoteConfigBackend,
  StorageBackend,
} from './RemoteConfig.shared';
import {
  fetchAndActivate,
  getAll,
  getRemoteConfig,
  getValue,
} from 'firebase/remote-config';

import { app } from '../web/firebase'; // Import the initialized Firebase app
import {
  clearAllLocalOverrides as clearAllLocalOverridesShared,
  clearLocalOverride as clearLocalOverrideShared,
  getAllFeatureFlags as getAllFeatureFlagsShared,
  getFeatureFlag as getFeatureFlagShared,
  getLocalOverrides as getLocalOverridesShared,
  initRemoteConfig as initRemoteConfigShared,
  refreshRemoteConfig as refreshRemoteConfigShared,
  setLocalOverride as setLocalOverrideShared,
} from './RemoteConfig.shared';

const remoteConfig = getRemoteConfig(app);

// Web-specific storage backend using LocalStorage
const webStorageBackend: StorageBackend = {
  getItem: async (key: string): Promise<string | null> => {
    return localStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    localStorage.removeItem(key);
  },
};

// Web-specific remote config backend using Firebase Web SDK
const webRemoteConfigBackend: RemoteConfigBackend = {
  getValue: (key: string) => {
    return getValue(remoteConfig, key);
  },
  getAll: () => {
    return getAll(remoteConfig);
  },
  setDefaults: async (defaults: Record<string, any>) => {
    remoteConfig.defaultConfig = {
      ...remoteConfig.defaultConfig,
      ...defaults,
    };
  },
  setConfigSettings: async (settings: Record<string, any>) => {
    remoteConfig.settings = {
      ...remoteConfig.settings,
      ...settings,
    };
  },
  fetchAndActivate: async (): Promise<boolean> => {
    return await fetchAndActivate(remoteConfig);
  },
};

export type { FeatureFlagValue } from './RemoteConfig.shared';

export const clearAllLocalOverrides = () =>
  clearAllLocalOverridesShared(webStorageBackend);

export const clearLocalOverride = (flag: string) =>
  clearLocalOverrideShared(webStorageBackend, flag);

export const getAllFeatureFlags = () =>
  getAllFeatureFlagsShared(webRemoteConfigBackend, webStorageBackend);
// Export the shared functions with web-specific backends
export const getFeatureFlag = <T extends FeatureFlagValue>(
  flag: string,
  defaultValue: T,
) =>
  getFeatureFlagShared(
    webRemoteConfigBackend,
    webStorageBackend,
    flag,
    defaultValue,
  );
export const getLocalOverrides = () =>
  getLocalOverridesShared(webStorageBackend);
export const initRemoteConfig = () =>
  initRemoteConfigShared(webRemoteConfigBackend);
// Re-export types for convenience
export const refreshRemoteConfig = () =>
  refreshRemoteConfigShared(webRemoteConfigBackend);

export const setLocalOverride = (flag: string, value: FeatureFlagValue) =>
  setLocalOverrideShared(webStorageBackend, flag, value);

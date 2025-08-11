// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11
import type { EmitterSubscription } from 'react-native';

// Mock for the react-native-clipboard package, implements only the methods that are used in the app,
// everything else will throw an error so that it's clearly visible what needs to be implemented
export default {
  getString(): Promise<string> {
    if (navigator.clipboard) {
      return navigator.clipboard.readText();
    }

    console.error('Clipboard is not supported in this browser');

    return Promise.resolve('');
  },

  setString(content: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }

    console.error('Clipboard is not supported in this browser');
  },

  getStrings(): Promise<string[]> {
    throw new Error('Method not implemented');
  },

  getImagePNG(): Promise<string> {
    throw new Error('Method not implemented');
  },

  getImageJPG(): Promise<string> {
    throw new Error('Method not implemented');
  },

  setImage(_: string): void {
    throw new Error('Method not implemented');
  },

  getImage(): Promise<string> {
    throw new Error('Method not implemented');
  },

  setStrings(_: string[]): void {
    throw new Error('Method not implemented');
  },

  hasString(): Promise<boolean> {
    throw new Error('Method not implemented');
  },

  hasImage(): Promise<boolean> {
    throw new Error('Method not implemented');
  },

  hasURL(): Promise<boolean> | undefined {
    throw new Error('Method not implemented');
  },

  hasNumber(): Promise<boolean> | undefined {
    throw new Error('Method not implemented');
  },

  hasWebURL(): Promise<boolean> | undefined {
    throw new Error('Method not implemented');
  },

  addListener(_: () => void): EmitterSubscription {
    throw new Error('Method not implemented');
  },

  removeAllListeners(): void {
    throw new Error('Method not implemented');
  },
};

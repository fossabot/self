#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function copyAssets() {
  const sourceDir = join(rootDir, 'svgs');
  const targetEsmDir = join(rootDir, 'dist/esm/svgs');
  const targetCjsDir = join(rootDir, 'dist/cjs/svgs');

  if (!existsSync(sourceDir)) {
    console.log('No svgs directory found, skipping asset copy');
    return;
  }

  // Create target directories if they don't exist
  mkdirSync(targetEsmDir, { recursive: true });
  mkdirSync(targetCjsDir, { recursive: true });

  // Copy SVGs to both ESM and CJS dist folders
  try {
    cpSync(sourceDir, targetEsmDir, { recursive: true });
    cpSync(sourceDir, targetCjsDir, { recursive: true });
    console.log('✅ SVG assets copied to dist folders');
  } catch (error) {
    console.error('❌ Failed to copy SVG assets:', error.message);
    process.exit(1);
  }
}

copyAssets();
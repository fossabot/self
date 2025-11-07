// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { PointEventType } from '@/utils/points/types';

import { checkEventProcessingStatus } from './registerEvents';

/**
 * Polls the server to check if an event has been processed.
 * Checks at: 2s, 4s, 8s, 16s, 32s, 32s, 32s, 32s
 */
export async function pollEventProcessingStatus(
  eventId: string,
  eventType: PointEventType,
): Promise<boolean> {
  let delay = 2000; // Start at 2 seconds
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(delay);

    try {
      const isProcessed = await checkEventProcessingStatus(eventId, eventType);
      if (isProcessed) {
        return true;
      }
    } catch (error) {
      console.error(`Error checking event ${eventId} status:`, error);
      // Continue polling even on error
    }

    // Exponential backoff, max 32 seconds
    delay = Math.min(delay * 2, 32000);
  }

  return false; // Gave up after max attempts
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

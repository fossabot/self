// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { pollEventProcessingStatus } from '@/utils/points/eventPolling';
import {
  registerBackupPoints,
  registerNotificationPoints,
  registerReferralPoints,
} from '@/utils/points/registerEvents';
import type { PointEventType } from '@/utils/points/types';
import { POINT_VALUES } from '@/utils/points/types';
import { getPointsAddress } from '@/utils/points/utils';

/**
 * Shared helper to add an event to the store and start polling for processing.
 */
const addEventToStoreAndPoll = async (
  title: string,
  type: PointEventType,
  points: number,
  id: string,
): Promise<void> => {
  const { usePointEventStore } = await import('@/stores/pointEventStore');
  await usePointEventStore.getState().addEvent(title, type, points, id);

  // Start polling in background - don't await
  pollEventProcessingStatus(id, type).then(processed => {
    if (processed) {
      usePointEventStore.getState().markEventAsProcessed(id);
    }
  });
};

/**
 * Records a backup event by registering with API and storing locally.
 *
 * @returns Promise resolving to success status and error message if any
 */
export const recordBackupPointEvent = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const userAddress = await getPointsAddress();
    const response = await registerBackupPoints(userAddress);

    if (response.success && response.status === 200) {
      // TODO: Extract actual event ID from response.data when API is finalized
      // Expected: response.data.eventId or similar
      const id = response.data?.eventId ?? 'backup-' + Date.now();

      await addEventToStoreAndPoll(
        'Secret backed up',
        'backup',
        POINT_VALUES.backup,
        id,
      );
      return { success: true };
    }
    return { success: false, error: response.error };
  } catch (error) {
    console.error('Error recording backup point event:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

/**
 * Records a notification event by registering with API and storing locally.
 *
 * @returns Promise resolving to success status and error message if any
 */
export const recordNotificationPointEvent = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const userAddress = await getPointsAddress();
    const response = await registerNotificationPoints(userAddress);

    if (response.success && response.status === 200) {
      // TODO: Extract actual event ID from response.data when API is finalized
      const id = response.data?.eventId ?? 'notification-' + Date.now();

      await addEventToStoreAndPoll(
        'Push notifications enabled',
        'notification',
        POINT_VALUES.notification,
        id,
      );
      return { success: true };
    }
    return { success: false, error: response.error };
  } catch (error) {
    console.error('Error recording notification point event:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

/**
 * Records a referral event by registering with API and storing locally.
 *
 * @param referrer - The address of the user referring
 * @returns Promise resolving to success status and error message if any
 */
export const recordReferralPointEvent = async (
  referrer: string,
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const referee = await getPointsAddress();
    const response = await registerReferralPoints({ referee, referrer });

    if (response.success && response.status === 200) {
      // TODO: Extract actual event ID from response.data when API is finalized
      const id = response.data?.eventId ?? 'refer-' + Date.now();

      await addEventToStoreAndPoll(
        'Friend referred',
        'refer',
        POINT_VALUES.referee,
        id,
      );
      return { success: true };
    }
    return { success: false, error: response.error };
  } catch (error) {
    console.error('Error recording referral point event:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
};

// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  IncomingPoints,
  PointEvent,
  PointEventType,
} from '@/utils/points';
import { getIncomingPoints, getNextSundayNoonUTC } from '@/utils/points';

interface PointEventState {
  events: PointEvent[];
  isLoading: boolean;
  loadEvents: () => Promise<void>;
  addEvent: (
    title: string,
    type: PointEventType,
    points: number,
    id: string,
  ) => Promise<void>;
  markEventAsProcessed: (id: string) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  clearEvents: () => Promise<void>;
  totalOptimisticIncomingPoints: () => number;
  incomingPoints: IncomingPoints & {
    lastUpdated: number | null;
    isUpdating: boolean;
  };
  refreshIncomingPoints: () => Promise<void>;
}

const STORAGE_KEY = '@point_events';

export const usePointEventStore = create<PointEventState>()((set, get) => ({
  incomingPoints: {
    amount: 0,
    lastUpdated: null,
    isUpdating: false,
    expectedDate: getNextSundayNoonUTC(),
  },
  events: [],
  isLoading: false,

  loadEvents: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const events = JSON.parse(stored);
        set({ events, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading point events:', error);
      set({ isLoading: false });
    }
  },
  /*
   * Fetches incoming points from the backend and updates the store.
   */
  refreshIncomingPoints: async () => {
    // Avoid concurrent updates
    if (get().incomingPoints.isUpdating) {
      return;
    }
    set({
      incomingPoints: {
        ...get().incomingPoints,
        isUpdating: true,
      },
    });
    // Fetch incoming points
    try {
      const points = await getIncomingPoints();
      if (points === null) {
        set({
          incomingPoints: {
            ...get().incomingPoints,
            isUpdating: false,
          },
        });
        return;
      }
      set({
        incomingPoints: {
          lastUpdated: Date.now(),
          amount: points.amount,
          expectedDate: points.expectedDate,
          isUpdating: false,
        },
      });
    } catch (error) {
      console.error('Error refreshing incoming points:', error);
      set({
        incomingPoints: {
          ...get().incomingPoints,
          isUpdating: false,
        },
      });
    }
  },
  /*
   * Calculates the total optimistic incoming points based on the current events.
   */
  totalOptimisticIncomingPoints: () => {
    const optimisticIncomingPoints = get()
      .events.filter(event => event.processedAt === null)
      .reduce((sum, event) => sum + event.points, 0);
    return optimisticIncomingPoints + get().incomingPoints.amount;
  },

  addEvent: async (title, type, points, id) => {
    try {
      const newEvent: PointEvent = {
        id,
        title,
        type,
        timestamp: Date.now(),
        points,
        processedAt: null,
      };

      const currentEvents = get().events;
      const updatedEvents = [newEvent, ...currentEvents];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      set({ events: updatedEvents });
    } catch (error) {
      console.error('Error adding point event:', error);
    }
  },
  markEventAsProcessed: async (id: string) => {
    try {
      const currentEvents = get().events;
      const updatedEvents = currentEvents.map(event =>
        event.id === id ? { ...event, processedAt: Date.now() } : event,
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      set({ events: updatedEvents });
      get().refreshIncomingPoints();
    } catch (error) {
      console.error('Error marking point event as processed:', error);
    }
  },

  removeEvent: async id => {
    try {
      const currentEvents = get().events;
      const updatedEvents = currentEvents.filter(event => event.id !== id);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
      set({ events: updatedEvents });
    } catch (error) {
      console.error('Error removing point event:', error);
    }
  },

  clearEvents: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ events: [] });
    } catch (error) {
      console.error('Error clearing point events:', error);
    }
  },
}));

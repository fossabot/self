// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';

export const DEFAULT_COMPACT_WIDTH = 360;
export const DEFAULT_COMPACT_HEIGHT = 720;

interface UseCompactLayoutOptions {
  compactWidth?: number;
  compactHeight?: number;
}

type ResponsiveDimension = 'width' | 'height' | 'any';

interface ResponsivePaddingOptions {
  min?: number;
  max?: number;
  percent?: number;
}

type ResponsiveValueConfig<T> = {
  compact: T;
  regular: T;
  dimension?: ResponsiveDimension;
};

const useCompactLayout = (
  options: UseCompactLayoutOptions = {},
): {
  width: number;
  height: number;
  isCompactWidth: boolean;
  isCompactHeight: boolean;
  isCompact: boolean;
  selectResponsiveValue: <T>(
    compactValue: T,
    regularValue: T,
    dimension?: ResponsiveDimension,
  ) => T;
  selectResponsiveValues: <TConfig extends Record<string, ResponsiveValueConfig<unknown>>>(
    config: TConfig,
  ) => {
    [K in keyof TConfig]: TConfig[K] extends ResponsiveValueConfig<infer TValue>
      ? TValue
      : never;
  };
  getResponsiveHorizontalPadding: (options?: ResponsivePaddingOptions) => number;
} => {
  const { width, height } = useWindowDimensions();
  const compactWidth = options.compactWidth ?? DEFAULT_COMPACT_WIDTH;
  const compactHeight = options.compactHeight ?? DEFAULT_COMPACT_HEIGHT;

  const isCompactWidth = width < compactWidth;
  const isCompactHeight = height < compactHeight;
  const selectResponsiveValue = useCallback(
    <T>(
      compactValue: T,
      regularValue: T,
      dimension: ResponsiveDimension = 'any',
    ): T => {
      if (dimension === 'width') {
        return isCompactWidth ? compactValue : regularValue;
      }

      if (dimension === 'height') {
        return isCompactHeight ? compactValue : regularValue;
      }

      return isCompactWidth || isCompactHeight ? compactValue : regularValue;
    },
    [isCompactHeight, isCompactWidth],
  );

  const selectResponsiveValues = useCallback(
    <TConfig extends Record<string, ResponsiveValueConfig<unknown>>>(
      config: TConfig,
    ) => {
      const entries = Object.entries(config) as Array<[
        keyof TConfig,
        ResponsiveValueConfig<unknown>,
      ]>;
      const result = {} as {
        [K in keyof TConfig]: TConfig[K] extends ResponsiveValueConfig<infer TValue>
          ? TValue
          : never;
      };

      entries.forEach(([key, { compact, regular, dimension }]) => {
        result[key] = selectResponsiveValue(compact, regular, dimension);
      });

      return result;
    },
    [selectResponsiveValue],
  );

  const getResponsiveHorizontalPadding = useCallback(
    (paddingOptions: ResponsivePaddingOptions = {}): number => {
      const { min = 16, max, percent = 0.06 } = paddingOptions;
      const computed = width * percent;
      const withMin = Math.max(min, computed);
      return typeof max === 'number' ? Math.min(max, withMin) : withMin;
    },
    [width],
  );

  return {
    width,
    height,
    isCompactWidth,
    isCompactHeight,
    isCompact: isCompactWidth || isCompactHeight,
    selectResponsiveValue,
    selectResponsiveValues,
    getResponsiveHorizontalPadding,
  };
};

export default useCompactLayout;

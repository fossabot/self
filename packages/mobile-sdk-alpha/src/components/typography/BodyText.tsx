// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { forwardRef } from 'react';
import type { TamaguiTextElement, TextProps } from 'tamagui';
import { Text } from 'tamagui';

import { useTypographyTheme } from './context';

export const BodyText = forwardRef<TamaguiTextElement, TextProps>((props, ref) => {
  const { fonts } = useTypographyTheme();
  return <Text ref={ref} fontFamily={fonts.body} {...props} />;
});

BodyText.displayName = 'BodyText';

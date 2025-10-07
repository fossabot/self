// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { forwardRef } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import type { TextProps, TamaguiTextElement } from 'tamagui';
import { Text } from 'tamagui';

import { useTypographyTheme } from './context';

interface TitleProps extends TextProps {
  size?: 'default' | 'large';
  style?: StyleProp<TextStyle>;
}

export const Title = forwardRef<TamaguiTextElement, TitleProps>(({ size = 'default', ...props }, ref) => {
  const { fonts } = useTypographyTheme();
  const fontSize = size === 'large' ? 38 : 28;
  const lineHeight = size === 'large' ? 47 : 35;
  
  return (
    <Text
      ref={ref}
      fontSize={fontSize}
      lineHeight={lineHeight}
      fontFamily={fonts.heading}
      {...props}
    />
  );
});
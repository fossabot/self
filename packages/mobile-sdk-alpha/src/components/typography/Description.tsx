// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { forwardRef } from 'react';
import type { TextProps, TamaguiTextElement } from 'tamagui';
import { Text } from 'tamagui';

import { slate500 } from '../../constants/colors';
import { useTypographyTheme } from './context';

export const Description = forwardRef<TamaguiTextElement, TextProps>((props, ref) => {
  const { fonts } = useTypographyTheme();
  return (
    <Text
      ref={ref}
      color={slate500}
      fontSize={18}
      lineHeight={23}
      textAlign="center"
      fontFamily={fonts.body}
      textBreakStrategy="balanced"
      {...props}
    />
  );
});
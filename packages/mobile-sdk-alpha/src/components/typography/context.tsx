// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { createContext, type PropsWithChildren, useContext } from 'react';

import { defaultConfig } from '../../config/defaults';

export interface TypographyTheme {
  fonts: {
    body: string;
    heading: string;
    monospace: string;
  };
}

const defaultFonts: TypographyTheme['fonts'] = {
  body: defaultConfig.theme.fonts?.body || 'DINOT-Medium',
  heading: defaultConfig.theme.fonts?.heading || 'Advercase-Regular',
  monospace: defaultConfig.theme.fonts?.monospace || 'IBM Plex Mono',
};

const TypographyContext = createContext<TypographyTheme>({
  fonts: defaultFonts,
});

export interface TypographyProviderProps {
  theme?: {
    fonts?: Partial<TypographyTheme['fonts']>;
  };
}

export function TypographyProvider({
  children,
  theme,
}: PropsWithChildren<TypographyProviderProps>) {
  const contextValue: TypographyTheme = {
    fonts: {
      body: theme?.fonts?.body || defaultFonts.body,
      heading: theme?.fonts?.heading || defaultFonts.heading,
      monospace: theme?.fonts?.monospace || defaultFonts.monospace,
    },
  };

  return <TypographyContext.Provider value={contextValue}>{children}</TypographyContext.Provider>;
}

export function useTypographyTheme(): TypographyTheme {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('useTypographyTheme must be used within a TypographyProvider');
  }
  return context;
}
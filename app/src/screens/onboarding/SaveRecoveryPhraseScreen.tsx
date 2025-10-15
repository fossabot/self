// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React, { useCallback, useMemo, useState } from 'react';

import {
  Caption,
  Description,
  PrimaryButton,
  SecondaryButton,
  Title,
} from '@selfxyz/mobile-sdk-alpha/components';

import Mnemonic from '@/components/Mnemonic';
import useHapticNavigation from '@/hooks/useHapticNavigation';
import useMnemonic from '@/hooks/useMnemonic';
import { ExpandableBottomLayout } from '@/layouts/ExpandableBottomLayout';
import useCompactLayout from '@/hooks/useCompactLayout';
import { useSettingStore } from '@/stores/settingStore';
import { STORAGE_NAME } from '@/utils/cloudBackup';
import { black, slate400, white } from '@/utils/colors';

const SaveRecoveryPhraseScreen: React.FC = () => {
  const [userHasSeenMnemonic, setUserHasSeenMnemonic] = useState(false);
  const { mnemonic, loadMnemonic } = useMnemonic();
  const { cloudBackupEnabled } = useSettingStore();
  const { selectResponsiveValues } = useCompactLayout({
    compactHeight: 780,
  });
  const {
    topPadding,
    bottomPadding,
    sectionGap,
    titleFontSize,
    titleLineHeight,
    descriptionFontSize,
    descriptionLineHeight,
  } = selectResponsiveValues({
    topPadding: { compact: 12, regular: 20, dimension: 'height' },
    bottomPadding: { compact: 6, regular: 10, dimension: 'height' },
    sectionGap: { compact: 6, regular: 10, dimension: 'height' },
    titleFontSize: { compact: 26, regular: 28, dimension: 'width' },
    titleLineHeight: { compact: 32, regular: 35, dimension: 'width' },
    descriptionFontSize: { compact: 16, regular: 18, dimension: 'width' },
    descriptionLineHeight: { compact: 21, regular: 23, dimension: 'width' },
  });
  const titleStyle = useMemo(
    () => ({
      paddingTop: topPadding,
      textAlign: 'center',
      fontSize: titleFontSize,
      lineHeight: titleLineHeight,
    }),
    [titleFontSize, titleLineHeight, topPadding],
  );
  const descriptionStyle = useMemo(
    () => ({
      paddingBottom: bottomPadding,
      fontSize: descriptionFontSize,
      lineHeight: descriptionLineHeight,
    }),
    [bottomPadding, descriptionFontSize, descriptionLineHeight],
  );

  const onRevealWords = useCallback(async () => {
    await loadMnemonic();
    setUserHasSeenMnemonic(true);
  }, [loadMnemonic]);

  const onCloudBackupPress = useHapticNavigation('CloudBackupSettings', {
    params: { nextScreen: 'SaveRecoveryPhrase' },
  });
  const onSkipPress = useHapticNavigation('AccountVerifiedSuccess', {
    action: 'confirm',
  });

  return (
    <ExpandableBottomLayout.Layout backgroundColor={black}>
      <ExpandableBottomLayout.TopSection
        roundTop
        backgroundColor={white}
        justifyContent="space-between"
        gap={sectionGap}
      >
        <Title style={titleStyle}>
          Save your recovery phrase
        </Title>
        <Description style={descriptionStyle}>
          This phrase is the only way to recover your account. Keep it secret,
          keep it safe.
        </Description>
      </ExpandableBottomLayout.TopSection>
      <ExpandableBottomLayout.BottomSection
        style={{ paddingTop: 0 }}
        gap={10}
        backgroundColor={white}
      >
        <Mnemonic words={mnemonic} onRevealWords={onRevealWords} />
        <Caption style={{ color: slate400 }}>
          You can reveal your recovery phrase in settings.
        </Caption>
        <PrimaryButton onPress={onCloudBackupPress}>
          Manage {STORAGE_NAME} backups
        </PrimaryButton>
        <SecondaryButton onPress={onSkipPress}>
          {userHasSeenMnemonic || cloudBackupEnabled
            ? 'Continue'
            : 'Skip making a backup'}
        </SecondaryButton>
      </ExpandableBottomLayout.BottomSection>
    </ExpandableBottomLayout.Layout>
  );
};

export default SaveRecoveryPhraseScreen;

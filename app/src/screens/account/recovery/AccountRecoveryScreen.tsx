// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React from 'react';
import { View, YStack } from 'tamagui';

import {
  Description,
  PrimaryButton,
  SecondaryButton,
  Title,
} from '@selfxyz/mobile-sdk-alpha/components';
import { BackupEvents } from '@selfxyz/mobile-sdk-alpha/constants/analytics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useHapticNavigation from '@/hooks/useHapticNavigation';
import RestoreAccountSvg from '@/images/icons/restore_account.svg';
import { ExpandableBottomLayout } from '@/layouts/ExpandableBottomLayout';
import useCompactLayout from '@/hooks/useCompactLayout';
import { black, slate600, white } from '@/utils/colors';

const AccountRecoveryScreen: React.FC = () => {
  const onRestoreAccountPress = useHapticNavigation('AccountRecoveryChoice');
  const onCreateAccountPress = useHapticNavigation('CloudBackupSettings', {
    params: {
      nextScreen: 'SaveRecoveryPhrase',
    },
  });
  const { selectResponsiveValues, getResponsiveHorizontalPadding } = useCompactLayout();
  const { bottom } = useSafeAreaInsets();

  const {
    iconSize,
    iconPadding,
    contentGap,
    descriptionSize,
    titleSize,
    buttonStackGap,
    buttonPaddingTop,
    extraBottomPadding,
  } = selectResponsiveValues({
    iconSize: { compact: 64, regular: 80 },
    iconPadding: { compact: '$4', regular: '$5' },
    contentGap: { compact: '$2', regular: '$2.5' },
    descriptionSize: { compact: 15, regular: 16 },
    titleSize: { compact: 26, regular: 32 },
    buttonStackGap: { compact: '$2', regular: '$2.5' },
    buttonPaddingTop: { compact: '$4', regular: '$6' },
    extraBottomPadding: { compact: 16, regular: 24 },
  });
  const horizontalPadding = getResponsiveHorizontalPadding({ percent: 0.06 });
  const bottomPadding = bottom + extraBottomPadding;

  return (
    <ExpandableBottomLayout.Layout backgroundColor={black}>
      <ExpandableBottomLayout.TopSection backgroundColor={black}>
        <View
          borderColor={slate600}
          borderWidth="$1"
          borderRadius="$10"
          padding={iconPadding}
        >
          <RestoreAccountSvg height={iconSize} width={iconSize} color={white} />
        </View>
      </ExpandableBottomLayout.TopSection>
      <ExpandableBottomLayout.BottomSection
        backgroundColor={white}
        paddingBottom={bottomPadding}
        paddingHorizontal={horizontalPadding}
      >
        <YStack alignItems="center" gap={contentGap} paddingBottom="$2">
          <Title style={{ fontSize: titleSize, textAlign: 'center' }}>
            Restore your Self account
          </Title>
          <Description
            style={{ fontSize: descriptionSize, textAlign: 'center' }}
          >
            By continuing, you certify that this passport belongs to you and is
            not stolen or forged.
          </Description>

          <YStack gap={buttonStackGap} width="100%" paddingTop={buttonPaddingTop}>
            <PrimaryButton
              trackEvent={BackupEvents.ACCOUNT_RECOVERY_STARTED}
              onPress={onRestoreAccountPress}
            >
              Restore my account
            </PrimaryButton>
            <SecondaryButton
              trackEvent={BackupEvents.CREATE_NEW_ACCOUNT}
              onPress={onCreateAccountPress}
            >
              Create new account
            </SecondaryButton>
          </YStack>
        </YStack>
      </ExpandableBottomLayout.BottomSection>
    </ExpandableBottomLayout.Layout>
  );
};

export default AccountRecoveryScreen;

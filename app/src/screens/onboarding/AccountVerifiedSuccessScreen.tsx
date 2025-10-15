// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React from 'react';
import { YStack } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Description,
  PrimaryButton,
  Title,
} from '@selfxyz/mobile-sdk-alpha/components';
import { BackupEvents } from '@selfxyz/mobile-sdk-alpha/constants/analytics';

import proofSuccessAnimation from '@/assets/animations/proof_success.json';
import { DelayedLottieView } from '@/components/DelayedLottieView';
import { ExpandableBottomLayout } from '@/layouts/ExpandableBottomLayout';
import useCompactLayout from '@/hooks/useCompactLayout';
import type { RootStackParamList } from '@/navigation';
import { styles } from '@/screens/verification/ProofRequestStatusScreen';
import { black, white } from '@/utils/colors';
import { buttonTap } from '@/utils/haptic';

const AccountVerifiedSuccessScreen: React.FC = ({}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectResponsiveValues, getResponsiveHorizontalPadding } = useCompactLayout();
  const { bottom } = useSafeAreaInsets();

  const {
    topPadding,
    gap,
    stackMarginBottom,
    titleSize,
    descriptionSize,
    bottomPaddingOffset,
    contentBottomPadding,
  } = selectResponsiveValues({
    topPadding: { compact: 24, regular: 40 },
    gap: { compact: 8, regular: 10 },
    stackMarginBottom: { compact: 12, regular: 20 },
    titleSize: { compact: 28, regular: 32 },
    descriptionSize: { compact: 15, regular: 16 },
    bottomPaddingOffset: { compact: 16, regular: 24 },
    contentBottomPadding: { compact: 12, regular: 20 },
  });
  const horizontalPadding = getResponsiveHorizontalPadding({ percent: 0.06 });
  const bottomPadding = bottom + bottomPaddingOffset;

  return (
    <ExpandableBottomLayout.Layout backgroundColor={white}>
      <ExpandableBottomLayout.TopSection backgroundColor={black} roundTop>
        <DelayedLottieView
          autoPlay
          loop={false}
          source={proofSuccessAnimation}
          style={styles.animation}
          cacheComposition={true}
          renderMode="HARDWARE"
        />
      </ExpandableBottomLayout.TopSection>
      <ExpandableBottomLayout.BottomSection
        backgroundColor={white}
        paddingBottom={bottomPadding}
      >
        <YStack
          paddingTop={topPadding}
          paddingHorizontal={horizontalPadding}
          paddingBottom={contentBottomPadding}
          justifyContent="center"
          alignItems="center"
          marginBottom={stackMarginBottom}
          gap={gap}
        >
          <Title size="large" style={{ fontSize: titleSize }}>
            ID Verified
          </Title>
          <Description style={{ fontSize: descriptionSize, textAlign: 'center' }}>
            Your document's information is now protected by Self ID. Just scan a
            participating partner's QR code to prove your identity.
          </Description>
        </YStack>
        <PrimaryButton
          trackEvent={BackupEvents.ACCOUNT_VERIFICATION_COMPLETED}
          onPress={() => {
            buttonTap();
            navigation.navigate('Home');
          }}
        >
          Continue
        </PrimaryButton>
      </ExpandableBottomLayout.BottomSection>
    </ExpandableBottomLayout.Layout>
  );
};

export default AccountVerifiedSuccessScreen;

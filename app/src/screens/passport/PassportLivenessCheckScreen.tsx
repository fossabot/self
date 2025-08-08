// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  FaceSDK,
  ImageType,
  LivenessStatus,
  MatchFacesImage,
  MatchFacesRequest,
  ProcessingMode,
} from '@regulaforensics/face-sdk';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import proveLoadingAnimation from '../../assets/animations/loading/prove.json';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import ButtonsContainer from '../../components/ButtonsContainer';
import TextsContainer from '../../components/TextsContainer';
import Additional from '../../components/typography/Additional';
import Description from '../../components/typography/Description';
import { Title } from '../../components/typography/Title';
import { PassportEvents } from '../../consts/analytics';
import useHapticNavigation from '../../hooks/useHapticNavigation';
import { ExpandableBottomLayout } from '../../layouts/ExpandableBottomLayout';
import { black, white } from '../../utils/colors';
import { feedbackSuccess } from '../../utils/haptic';
import { hasAnyValidRegisteredDocument } from '../../utils/proving';

type PassportLivenessCheckRouteProp = RouteProp<
  {
    PassportLivenessCheck: {
      passportPhoto: string;
    };
  },
  'PassportLivenessCheck'
>;

interface PassportLivenessCheckScreenProps {}

const PassportLivenessCheckScreen: React.FC<
  PassportLivenessCheckScreenProps
> = () => {
  const navigation = useNavigation();
  const route = useRoute<PassportLivenessCheckRouteProp>();
  const passportPhoto = route.params?.passportPhoto || '';

  const navigateToLaunch = useHapticNavigation('Launch', {
    action: 'cancel',
  });
  const navigateToHome = useHapticNavigation('Home', {
    action: 'cancel',
  });

  const [isLoading, setIsLoading] = useState(false);

  if (!passportPhoto || passportPhoto === '') {
    console.warn('Passport photo not available, Skipping liveness check');
    navigation.navigate('ConfirmBelongingScreen', {});
  }

  useEffect(() => {
    async function init() {
      // TODO replace
      FaceSDK.instance.serviceUrl =
        'https://sought-kodiak-stirred.ngrok-free.app';
      const isInitialised = await FaceSDK.instance.isInitialized();

      if (!isInitialised) {
        await FaceSDK.instance.initialize();
      }
    }

    init();
  }, []);

  const handleStartLivenessCheck = async () => {
    try {
      setIsLoading(true);

      const livenessResponse = await FaceSDK.instance.startLiveness();
      await FaceSDK.instance.stopLiveness();

      if (livenessResponse.liveness !== LivenessStatus.PASSED) {
        console.warn('Liveness check failed');
        // return;
      }
      const image = livenessResponse.image;
      const imageType = ImageType.LIVE;

      if (image && imageType) {
        const livenessImage = new MatchFacesImage(image, imageType);
        const passportImage = new MatchFacesImage(passportPhoto, imageType);

        const matchFacesRequest = new MatchFacesRequest([
          livenessImage,
          passportImage,
        ]);

        const matchFacesResponse = await FaceSDK.instance.matchFaces(
          matchFacesRequest,
          {
            config: {
              processingMode: ProcessingMode.ONLINE,
            },
          },
        );

        if (
          matchFacesResponse.results.length > 0 &&
          matchFacesResponse.results[0].similarity > 0.8
        ) {
          feedbackSuccess();
        } else {
          console.warn('Face matching failed - similarity too low');
        }
      }
    } catch (error) {
      console.error('Face capture error:', error);
    } finally {
      setIsLoading(false);
      navigation.navigate('ConfirmBelongingScreen', {});
    }
  };

  const onCancelPress = async () => {
    const hasValidDocument = await hasAnyValidRegisteredDocument();
    if (hasValidDocument) {
      navigateToHome();
    } else {
      navigateToLaunch();
    }
  };

  return (
    <ExpandableBottomLayout.Layout backgroundColor={white}>
      <ExpandableBottomLayout.TopSection roundTop backgroundColor={black}>
        <LottieView
          autoPlay
          loop={true}
          source={proveLoadingAnimation}
          style={{ width: 60, height: 60, marginTop: 30, marginBottom: 0 }}
          resizeMode="cover"
          renderMode="HARDWARE"
        />
        <Additional style={styles.placeholderText}>
          Not sure what to display here 😅
        </Additional>
      </ExpandableBottomLayout.TopSection>
      <ExpandableBottomLayout.BottomSection backgroundColor={white}>
        <TextsContainer>
          <Title>Verify Your Identity</Title>
          <Description textBreakStrategy="balanced">
            Please look directly at the camera and follow the instructions
          </Description>
          <Additional textBreakStrategy="balanced">
            This helps us ensure you are the person presenting the document
          </Additional>
        </TextsContainer>
        <ButtonsContainer>
          {isLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color={black} style={{ marginRight: 8 }} />
              <Description color={black}>Verification in progress</Description>
            </View>
          ) : (
            <>
              <PrimaryButton
                trackEvent={PassportEvents.CAMERA_SCAN_STARTED}
                onPress={handleStartLivenessCheck}
              >
                Start Face Capture
              </PrimaryButton>
              <SecondaryButton
                trackEvent={PassportEvents.CAMERA_SCAN_CANCELLED}
                onPress={onCancelPress}
              >
                Cancel
              </SecondaryButton>
            </>
          )}
        </ButtonsContainer>
      </ExpandableBottomLayout.BottomSection>
    </ExpandableBottomLayout.Layout>
  );
};

export default PassportLivenessCheckScreen;

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: white,
    fontSize: 16,
    textAlign: 'center',
  },
});

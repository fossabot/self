import { PassportData } from '@selfxyz/common';
import { DocumentMetadata } from '@selfxyz/common/utils/types';
import { View, Text, Button } from 'react-native';
import { extractMRZInfo } from '../mrz';
import { useCallback, useLayoutEffect, useState } from 'react';


interface DocumentData {
  data: PassportData;
  metadata: DocumentMetadata;
}

interface PassportCameraScreenProps {
  onPassportRead: (error: Error | null, mrzData?: ReturnType<typeof extractMRZInfo>) => void;
}

export const PassportCameraScreen = (props: PassportCameraScreenProps) => {
  return <View>
    <Text>Passport Camera</Text>
    <Button onPress={() => {
      props.onPassportRead(null, extractMRZInfo(''))
    }} title="Read Passport" />
  </View>
}


interface External {
  getSecret: () => Promise<string>
  getAllDocuments: () => Promise<{
    [documentId: string]: DocumentData;
  }>;
  setDocument: (doc: DocumentData, documentId: string) => Promise<boolean>

  onOnboardingSuccess: () => void;
  onOnboardingFailure: (error: Error) => void;

  onDisclosureSuccess: () => void;
  onDisclosureFailure: (error: Error) => void;
}

export const QrCodeScreen = (props: {
  onSuccess: () => void;
  onFailure: (error: Error) => void;
}) => {
  return <View>
    <Text>QrCodeS</Text>
  </View>
}

export const OnboardingScreen = function OnboardingScreen(props: {
  onSuccess: () => void;
  onFailure: (error: Error) => void;
  setDocument: (doc: DocumentData, documentId: string) => Promise<boolean>
}) {
  const onPassportRead = useCallback((error: Error | null, mrzData?: ReturnType<typeof extractMRZInfo>) => {
    if (error) {
      props.onFailure(error);
    } else {
      props.onSuccess();
    }
  }, [props.onSuccess, props.onFailure]);

  return <View>
    <Text>Onboarding</Text>

    <PassportCameraScreen onPassportRead={onPassportRead} />
  </View>
}


export const SelfMobileSdk = (props: External) => {
  const {
    getAllDocuments,
    onOnboardingSuccess,
    onOnboardingFailure,
    onDisclosureSuccess,
    onDisclosureFailure,
    setDocument
  } = props;

  const [documents, setDocuments] = useState<{
    [documentId: string]: DocumentData;
  }>({});

  // TODO: add a isLoading state for when the documents are not yet known
  useLayoutEffect(() => {
    getAllDocuments().then((documents) => setDocuments(documents));
  }, [getAllDocuments]);

  // TODO: make sure the condition is valid

  if (Object.keys(documents).length === 0 || !Object.values(documents).some(doc => doc.metadata.isRegistered)) {
    // start onboarding flow
    return <OnboardingScreen onSuccess={onOnboardingSuccess} onFailure={onOnboardingFailure} setDocument={setDocument} />
  }

  return <QrCodeScreen onSuccess={onDisclosureSuccess} onFailure={onDisclosureFailure} />
}

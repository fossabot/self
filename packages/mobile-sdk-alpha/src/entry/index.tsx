import { PassportData } from '@selfxyz/common';
import { DocumentMetadata } from '@selfxyz/common/utils/types';
import { View, Text } from 'react-native';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { MRZScannerView } from '../components';
import { MRZData } from '../components/MRZScannerView';
import { createContext, useContext, ReactNode } from 'react';
import type { SelfClient, Config } from '../types/public';
import { createSelfClient } from '../client';
import { ParsedNFCResponse } from '../nfc';


interface DocumentData {
  data: PassportData;
  metadata: DocumentMetadata;
}

interface PassportCameraScreenProps {
  onMRZDetected: (mrzData: MRZData) => void;
}

export const PassportCameraScreen = (props: PassportCameraScreenProps) => {
  return <View>
    <Text>Passport Camera</Text>
    <MRZScannerView onMRZDetected={props.onMRZDetected} />
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

export const NFCScannerScreen = (props: {
  onSuccess: () => void;
  onFailure: (error: Error) => void;
}) => {
  const client = useSelfClient();
  const onNFCScan = useCallback((nfcData: ParsedNFCResponse) => {
    // scan the document
    // register the document
  }, [client, props.onSuccess, props.onFailure]);
  return <View>
    <Text>NFCScanner</Text>

  </View>
}

export const OnboardingScreen = (props: {
  onSuccess: () => void;
  onFailure: (error: Error) => void;
  setDocument: (doc: DocumentData, documentId: string) => Promise<boolean>
}) => {
  const [mrzData, setMrzData] = useState<MRZData | null>(null);
  const client = useSelfClient();
  const onMRZDetected = useCallback((mrzData: MRZData) => {
    client.registerDocument({scan: {mode: 'mrz', passportNumber: mrzData.documentNumber, dateOfBirth: mrzData.birthDate, dateOfExpiry: mrzData.expiryDate, issuingCountry: mrzData.countryCode}}).then((status) => {
      if (status.registered) {
        props.onSuccess();
        setMrzData(mrzData);
      } else {
        props.onFailure(new Error('Registration failed'));
      }
    })
  }, [client, props.onSuccess, props.onFailure]);

  return <View>
    <Text>Onboarding</Text>

    {!mrzData && <PassportCameraScreen onMRZDetected={onMRZDetected} />}

    {mrzData && <NFCScannerScreen onSuccess={props.onSuccess} onFailure={props.onFailure} />}

  </View>
}

/**
 * Context to provide the SelfClient instance throughout the app.
 */
const SelfClientContext = createContext<SelfClient | null>(null);

type SelfClientProviderProps = {
  config: Config;
  children: ReactNode;
};

/**
 * Provider component to supply a SelfClient instance to the component tree.
 */
export const SelfClientProvider = ({ config, children }: SelfClientProviderProps) => {
  const [client, setClient] = useState<SelfClient | null>(null);

  useEffect(() => {
    // You may want to allow adapters to be passed in as well, but for now use empty object
    const clientInstance = createSelfClient({ config, adapters: {} });
    setClient(clientInstance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config)]);

  return (
    <SelfClientContext.Provider value={client}>
      {children}
    </SelfClientContext.Provider>
  );
};

/**
 * Hook to access the SelfClient instance from context.
 * Throws if used outside of SelfClientProvider.
 */
export const useSelfClient = (): SelfClient => {
  const client = useContext(SelfClientContext);
  if (!client) {
    throw new Error('useSelfClient must be used within a SelfClientProvider');
  }
  return client;
};

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

  let component = null;

  // TODO: make sure the condition is valid

  if (Object.keys(documents).length === 0 || !Object.values(documents).some(doc => doc.metadata.isRegistered)) {
    // start onboarding flow
    component = <OnboardingScreen onSuccess={onOnboardingSuccess} onFailure={onOnboardingFailure} setDocument={setDocument} />
  }

  component = <QrCodeScreen onSuccess={onDisclosureSuccess} onFailure={onDisclosureFailure} />

  return (
    <SelfClientProvider config={{}}>
      {component}
    </SelfClientProvider>
  );
}

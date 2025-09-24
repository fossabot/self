import { useEffect } from 'react';
import { useProvingStore } from '../proving/provingMachine';
import { loadSelectedDocument } from '../documents/utils';
import type { SelfClient } from '../types/public';

/*
  Hook to prepare for proving a document by initializing the proving state machine.
  It loads the selected document and initializes the proving process based on the document type.
  returns functions to set FCM token and mark user confirmation, along with a boolean indicating readiness to prove.

  Usage:
    use `isReadyToProve` to enable/disable the confirmation button.
    call `setUserConfirmed` when the user presses your confirm button.
    and optionally call `setFcmToken` just before `setUserConfirmed` if you have an FCM token to provide.
    after calling `setUserConfirmed`, the proving process will start. Navigate to loading screen.
*/
export function usePrepareDocumentProof(selfClient: SelfClient) {
  const currentState = useProvingStore(state => state.currentState);
  const init = useProvingStore(state => state.init);
  const setFcmToken = useProvingStore(state => state.setFcmToken);
  const setUserConfirmed = useProvingStore(state => state.setUserConfirmed);
  const isReadyToProve = currentState === 'ready_to_prove';
  useEffect(() => {
    const initializeProving = async () => {
      try {
        const selectedDocument = await loadSelectedDocument(selfClient);
        if (selectedDocument?.data?.documentCategory === 'aadhaar') {
          init(selfClient, 'register');
        } else {
          init(selfClient, 'dsc');
        }
      } catch (error) {
        console.error('Error loading selected document:', error);
        init(selfClient, 'dsc');
      }
    };

    initializeProving();
  }, [init, selfClient]);
  return { setFcmToken, setUserConfirmed, isReadyToProve };
}
/*
  Display this to users before they confirm ownership of a document
*/
export function preRegistrationDescription() {
  return "By continuing, you certify that this passport, biometric ID or Aadhaar card belongs to you and is not stolen or forged. Once registered with Self, this document will be permanently linked to your identity and can't be linked to another one.";
}

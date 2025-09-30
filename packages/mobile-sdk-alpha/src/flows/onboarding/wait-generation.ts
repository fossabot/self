import { useProvingStore, type ProvingStateType } from '../../proving/provingMachine';
export { type ProvingStateType } from '../../proving/provingMachine';
export { getLoadingScreenText, getProvingTimeEstimate } from '../../proving/proving-display';

// States where it's safe to close the app
const safeToCloseStates = ['proving', 'post_proving', 'completed'];
// Define all terminal states that should stop animations and haptics
export const terminalStates: ProvingStateType[] = [
  'completed',
  'error',
  'failure',
  'passport_not_supported',
  'account_recovery_choice',
  'passport_data_not_found',
];

/*
  Get info about the state of generating a proof for documents during onboarding.
*/
export function useProofGenerationState() {
  const currentState = useProvingStore(state => state.currentState) ?? 'idle';
  const fcmToken = useProvingStore(state => state.fcmToken);
  const canCloseApp = safeToCloseStates.includes(currentState);
  return { currentState, fcmToken, canCloseApp };
}

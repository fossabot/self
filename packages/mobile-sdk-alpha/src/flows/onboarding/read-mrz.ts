/*
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.
*/

/*
 Used to check that the scanned MRZ info is valid before proceeding to NFC scan
 If invalid, we can show an error immediately instead of waiting for NFC to fail
*/
export function fastCheckIDInfo(documentNumber: string, dateOfBirth: string, dateOfExpiry: string): boolean {
  if (documentNumber.length > 9) {
    return false;
  }
  if (dateOfBirth.length !== 6) {
    return false;
  }
  if (dateOfExpiry.length !== 6) {
    return false;
  }
  return true;
}

export function mrzReadInstructions() {
  return 'Lay your document flat and position the machine readable text in the viewfinder';
}

export { MRZScannerView, MRZScannerViewProps } from '../../components/MRZScannerView';

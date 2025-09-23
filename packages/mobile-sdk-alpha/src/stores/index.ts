// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { DocumentCategory } from '@selfxyz/common/types';
import { Environment } from '@selfxyz/common/utils/types';

import { useProtocolStore } from './protocolStore';

export { cleanSelfApp, getSelfApp, setSelfApp, startAppListener } from './selfAppStore';

export async function fetchAllTreesAndCircuits(
  docCategory: DocumentCategory,
  environment: Environment,
  authorityKeyIdentifier: string,
) {
  await useProtocolStore.getState()[docCategory].fetch_all(environment, authorityKeyIdentifier);
}

export function getAltCSCAPublicKeys(docCategory: DocumentCategory) {
  if (docCategory === 'aadhaar') {
    return useProtocolStore.getState()[docCategory].public_keys;
  }
  return useProtocolStore.getState()[docCategory].alternative_csca;
}

export function getCommitmentTree(documentCategory: DocumentCategory) {
  const protocolStore = useProtocolStore.getState();
  return protocolStore[documentCategory].commitment_tree;
}

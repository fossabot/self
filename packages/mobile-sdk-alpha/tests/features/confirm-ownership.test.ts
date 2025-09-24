// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import type { PassportData } from '@selfxyz/common/types';
import type { IDDocument, SelfClient } from '../../src/types/public';
import { usePrepareDocumentProof } from '../../src/features/onboarding-confirm-ownership';
import * as documentsUtils from '../../src/documents/utils';
import { useProvingStore } from '../../src/proving/provingMachine';
import { DocumentMetadata } from '@selfxyz/common/utils/types';

// Mock the proving store at module level
vi.mock('../../src/proving/provingMachine', () => ({
  useProvingStore: vi.fn(),
}));

const createMockSelfClient = (): SelfClient => {
  return {
    trackEvent: vi.fn(),
    emit: vi.fn(),
    getPrivateKey: vi.fn().mockResolvedValue('mock-private-key'),
  } as unknown as SelfClient;
};

const createMockDocument = (documentCategory: string): { data: IDDocument; metadata: DocumentMetadata } => ({
  data: {
    documentCategory,
  } as IDDocument,
  metadata: {
    id: '',
    documentType: '',
    documentCategory: 'aadhaar',
    data: '',
    mock: false,
  },
});

describe('usePrepareDocumentProof', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize proving with "register" when document category is "aadhaar"', async () => {
    const mockSelfClient = createMockSelfClient();
    const mockDocument = createMockDocument('aadhaar');

    const loadSelectedDocumentSpy = vi.spyOn(documentsUtils, 'loadSelectedDocument').mockResolvedValue(mockDocument);

    const initSpy = vi.fn();
    const mockSetFcmToken = vi.fn();
    const mockSetUserConfirmed = vi.fn();
    
    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'ready_to_prove',
        init: initSpy,
        setFcmToken: mockSetFcmToken,
        setUserConfirmed: mockSetUserConfirmed,
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => usePrepareDocumentProof(mockSelfClient));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(loadSelectedDocumentSpy).toHaveBeenCalledWith(mockSelfClient);
    expect(initSpy).toHaveBeenCalledWith(mockSelfClient, 'register');
    expect(result.current.isReadyToProve).toBe(true);
  });

  it('should initialize proving with "dsc" when document category is not "aadhaar"', async () => {
    const mockSelfClient = createMockSelfClient();
    const mockDocument = createMockDocument('passport');

    const loadSelectedDocumentSpy = vi.spyOn(documentsUtils, 'loadSelectedDocument').mockResolvedValue(mockDocument);

    const initSpy = vi.fn();
    const mockSetFcmToken = vi.fn();
    const mockSetUserConfirmed = vi.fn();
    
    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'ready_to_prove',
        init: initSpy,
        setFcmToken: mockSetFcmToken,
        setUserConfirmed: mockSetUserConfirmed,
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => usePrepareDocumentProof(mockSelfClient));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(loadSelectedDocumentSpy).toHaveBeenCalledWith(mockSelfClient);
    expect(initSpy).toHaveBeenCalledWith(mockSelfClient, 'dsc');
    expect(result.current.isReadyToProve).toBe(true);
  });

  it('should initialize proving with "dsc" when no document is found', async () => {
    const mockSelfClient = createMockSelfClient();

    const loadSelectedDocumentSpy = vi.spyOn(documentsUtils, 'loadSelectedDocument').mockResolvedValue(null);

    const initSpy = vi.fn();
    const mockSetFcmToken = vi.fn();
    const mockSetUserConfirmed = vi.fn();
    
    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'ready_to_prove',
        init: initSpy,
        setFcmToken: mockSetFcmToken,
        setUserConfirmed: mockSetUserConfirmed,
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => usePrepareDocumentProof(mockSelfClient));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(loadSelectedDocumentSpy).toHaveBeenCalledWith(mockSelfClient);
    expect(initSpy).toHaveBeenCalledWith(mockSelfClient, 'dsc');
    expect(result.current.isReadyToProve).toBe(true);
  });

  it('should handle error during document loading and fallback to "dsc"', async () => {
    const mockSelfClient = createMockSelfClient();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const loadSelectedDocumentSpy = vi
      .spyOn(documentsUtils, 'loadSelectedDocument')
      .mockRejectedValue(new Error('Document load failed'));

    const initSpy = vi.fn();
    const mockSetFcmToken = vi.fn();
    const mockSetUserConfirmed = vi.fn();
    
    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'ready_to_prove',
        init: initSpy,
        setFcmToken: mockSetFcmToken,
        setUserConfirmed: mockSetUserConfirmed,
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => usePrepareDocumentProof(mockSelfClient));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(loadSelectedDocumentSpy).toHaveBeenCalledWith(mockSelfClient);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading selected document:', expect.any(Error));
    expect(initSpy).toHaveBeenCalledWith(mockSelfClient, 'dsc');
    expect(result.current.isReadyToProve).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  it('should return correct functions and state from proving store', () => {
    const mockSelfClient = createMockSelfClient();
    const mockSetFcmToken = vi.fn();
    const mockSetUserConfirmed = vi.fn();

    vi.spyOn(documentsUtils, 'loadSelectedDocument').mockResolvedValue(null);

    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'ready_to_prove',
        init: vi.fn(),
        setFcmToken: mockSetFcmToken,
        setUserConfirmed: mockSetUserConfirmed,
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => usePrepareDocumentProof(mockSelfClient));

    expect(result.current.setFcmToken).toBe(mockSetFcmToken);
    expect(result.current.setUserConfirmed).toBe(mockSetUserConfirmed);
    expect(result.current.isReadyToProve).toBe(true);
  });

  it('should return isReadyToProve as false when currentState is not "ready_to_prove"', () => {
    const mockSelfClient = createMockSelfClient();

    vi.spyOn(documentsUtils, 'loadSelectedDocument').mockResolvedValue(null);

    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'idle',
        init: vi.fn(),
        setFcmToken: vi.fn(),
        setUserConfirmed: vi.fn(),
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => usePrepareDocumentProof(mockSelfClient));

    expect(result.current.isReadyToProve).toBe(false);
  });

  it('should re-initialize when selfClient changes', async () => {
    const mockSelfClient1 = createMockSelfClient();
    const mockSelfClient2 = createMockSelfClient();

    const loadSelectedDocumentSpy = vi.spyOn(documentsUtils, 'loadSelectedDocument').mockResolvedValue(null);

    const initSpy = vi.fn();
    const mockSetFcmToken = vi.fn();
    const mockSetUserConfirmed = vi.fn();
    
    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'ready_to_prove',
        init: initSpy,
        setFcmToken: mockSetFcmToken,
        setUserConfirmed: mockSetUserConfirmed,
      };
      return selector(mockState);
    });

    const { result, rerender } = renderHook(({ client }) => usePrepareDocumentProof(client), {
      initialProps: { client: mockSelfClient1 },
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(initSpy).toHaveBeenCalledWith(mockSelfClient1, 'dsc');

    rerender({ client: mockSelfClient2 });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(initSpy).toHaveBeenCalledTimes(2);
    expect(initSpy).toHaveBeenCalledWith(mockSelfClient2, 'dsc');
  });

  it('should handle document with undefined documentCategory', async () => {
    const mockSelfClient = createMockSelfClient();
    const mockDocument = { data: {} as PassportData };

    const loadSelectedDocumentSpy = vi.spyOn(documentsUtils, 'loadSelectedDocument').mockResolvedValue(mockDocument);

    const initSpy = vi.fn();
    const mockSetFcmToken = vi.fn();
    const mockSetUserConfirmed = vi.fn();
    
    (useProvingStore as any).mockImplementation((selector: any) => {
      const mockState = {
        currentState: 'ready_to_prove',
        init: initSpy,
        setFcmToken: mockSetFcmToken,
        setUserConfirmed: mockSetUserConfirmed,
      };
      return selector(mockState);
    });

    const { result } = renderHook(() => usePrepareDocumentProof(mockSelfClient));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(loadSelectedDocumentSpy).toHaveBeenCalledWith(mockSelfClient);
    expect(initSpy).toHaveBeenCalledWith(mockSelfClient, 'dsc');
    expect(result.current.isReadyToProve).toBe(true);
  });
});

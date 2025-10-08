import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DocumentNFCScan from '../../src/screens/DocumentNFCScan';

describe('DocumentNFCScan screen', () => {
  it('presents NFC scanning guidance and responds to back presses', async () => {
    const onBack = vi.fn();
    const onNavigate = vi.fn();

    render(<DocumentNFCScan onBack={onBack} onNavigate={onNavigate} />);

    expect(screen.getByText('NFC Scan')).toBeInTheDocument();
    expect(screen.getByText('Scan NFC Chip')).toBeInTheDocument();
    expect(screen.getByText(/Place your phone against the NFC chip in your document/i)).toBeInTheDocument();
    expect(screen.getByText(/The chip contains encrypted data that verifies the authenticity/i)).toBeInTheDocument();
    expect(screen.getByText('Document Information')).toBeInTheDocument();
    expect(screen.getByText(/Document Number:/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

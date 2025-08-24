
'use client';

import { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PaymentMockDialog from '@/components/payments/PaymentMock';
import type { PaymentResult } from '@/types/payment';
import { useAppLogger } from '@/lib/logger';

type UseMockProviderProps = {
  onResult: (result: PaymentResult) => void;
};

export function useMockProvider({ onResult }: UseMockProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReference, setCurrentReference] = useState<string | null>(null);
  const { log } = useAppLogger('MockProvider');

  const showMockModal = useCallback((reference: string) => {
    log('INFO', 'Showing mock payment modal.', { reference });
    setCurrentReference(reference);
    setIsModalOpen(true);
  }, [log]);

  const handleResult = useCallback((result: Omit<PaymentResult, 'reference'>) => {
    if (currentReference) {
      log('INFO', 'Received result from mock dialog.', { result, reference: currentReference });
      onResult({ ...result, reference: currentReference });
    } else {
      log('ERROR', 'Received result from mock but no reference was set.');
    }
    setIsModalOpen(false);
    setCurrentReference(null);
  }, [currentReference, onResult, log]);

  const handleClose = useCallback(() => {
    log('INFO', 'Mock modal closed by user.');
    setIsModalOpen(false);
    if (currentReference) {
       onResult({
          status: 'CANCELLED',
          reference: currentReference,
          transactionId: `mock_${Math.random().toString(36).slice(2, 10)}`,
          reason: 'Pago cancelado por el usuario'
       });
    }
    setCurrentReference(null);
  }, [currentReference, onResult, log]);

  // Use a portal to render the dialog at the root level
  const MockModalPortal = () => {
    if (typeof document === 'undefined') return null; // Guard for SSR
    return ReactDOM.createPortal(
      <PaymentMockDialog
        open={isModalOpen}
        onClose={handleClose}
        onResult={handleResult}
      />,
      document.body
    );
  };

  // This is a bit of a trick to include the portal in the app tree
  // A cleaner way might be a context provider at the root layout
  useState(() => {
    if (typeof window !== 'undefined') {
      const existing = document.getElementById('mock-payment-portal');
      if (!existing) {
        const portalContainer = document.createElement('div');
        portalContainer.id = 'mock-payment-portal';
        document.body.appendChild(portalContainer);
        ReactDOM.render(<MockModalPortal />, portalContainer);
      }
    }
  });

  return { showMockModal };
}

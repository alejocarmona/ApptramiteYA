
'use client';

// This file is deprecated and its logic has been moved to the `TramiteFacil` component.
// It is kept for reference during the refactoring but can be safely deleted afterward.
// The `useMockProvider` hook is no longer in use.

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
  const { log } = useAppLogger('MockProvider-DEPRECATED');

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

  const MockModalPortal = useCallback(() => {
    if (typeof document === 'undefined') return null;
    
    const portalRoot = document.getElementById('mock-payment-portal-root');
    if (!portalRoot) {
      if (typeof document !== 'undefined') {
        const newPortalRoot = document.createElement('div');
        newPortalRoot.id = 'mock-payment-portal-root';
        document.body.appendChild(newPortalRoot);
        return ReactDOM.createPortal(
          <PaymentMockDialog
            open={isModalOpen}
            onClose={handleClose}
            onResult={handleResult}
          />,
          newPortalRoot
        );
      }
      return null;
    }

    return ReactDOM.createPortal(
      <PaymentMockDialog
        open={isModalOpen}
        onClose={handleClose}
        onResult={handleResult}
      />,
      portalRoot
    );
  }, [isModalOpen, handleClose, handleResult]);


  return { showMockModal, MockModalPortal };
}


'use client';

import {useState, useCallback} from 'react';
import {usePaymentMock} from '@/lib/flags';
import {useAppLogger} from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { getFirebaseFunctions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import type { PaymentInput, PaymentResult } from '@/types/payment';
import { useMockProvider } from './mock';

type UsePaymentProps = {
  onSuccess: (result: PaymentResult) => void;
  onError: (result: PaymentResult) => void;
};

export function usePayment({onSuccess, onError}: UsePaymentProps) {
  const isMock = usePaymentMock();
  const {log} = useAppLogger('PaymentProvider');
  const [isProcessing, setIsProcessing] = useState(false);

  const { showMockModal } = useMockProvider({ onResult: handlePaymentResult });

  function handlePaymentResult(result: PaymentResult) {
    log('INFO', 'Handling payment result from provider', { result });
    setIsProcessing(false);
    if (result.status === 'APPROVED') {
      onSuccess(result);
    } else {
      onError(result);
    }
  }

  const initiateMockPayment = useCallback((input: PaymentInput) => {
    const reference = `MOCK-${uuidv4()}`;
    log('INFO', 'Initiating MOCK payment', { input, reference });
    showMockModal(reference);
  }, [log, showMockModal]);

  const initiateRealPayment = useCallback(async (input: PaymentInput) => {
    const reference = `WM-${uuidv4()}`;
    log('INFO', 'Initiating REAL payment with Wompi', { input, reference });
    
    const functions = getFirebaseFunctions();
    const createWompiTransaction = httpsCallable(functions, 'createWompiTransaction');

    try {
      // In a real scenario, you'd collect payment method details here.
      // For now, we'll send a placeholder.
      const wompiPayload = {
        ...input,
        reference,
        paymentMethod: { type: "CARD", token: "tok_test_12345_ABCDE" },
      };

      const result = await createWompiTransaction(wompiPayload);
      log('SUCCESS', 'Wompi transaction created successfully', { result });

      // Here you would redirect to Wompi's payment page or handle the response.
      // For this exercise, we will assume a webhook would notify of the final status.
      // We will simulate an "APPROVED" response for flow continuation.
      handlePaymentResult({
        status: 'APPROVED',
        reference,
        transactionId: (result.data as any)?.wompiTransaction?.id || 'wompi-id-placeholder',
      });

    } catch (error) {
      log('ERROR', 'Wompi transaction failed', { error });
      handlePaymentResult({
        status: 'ERROR',
        reference,
        transactionId: 'failed-tx-id',
        reason: 'Error de comunicación con el servidor de pagos.'
      });
    }
  }, [log]);
  
  const initiatePayment = useCallback(async (input: PaymentInput) => {
    setIsProcessing(true);
    if (isMock) {
      initiateMockPayment(input);
    } else {
      await initiateRealPayment(input);
    }
  }, [isMock, initiateMockPayment, initiateRealPayment]);

  return {isProcessingPayment: isProcessing, initiatePayment};
}

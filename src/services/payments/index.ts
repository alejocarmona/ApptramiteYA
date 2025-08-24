
"use client";

import { httpsCallable, Functions } from 'firebase/functions';
import { getFirebaseFunctions } from '@/lib/firebase';
import { usePaymentMock } from '@/lib/flags';
import type { PaymentInput, PaymentResult } from '@/types/payment';

let functions: Functions;
try {
  functions = getFirebaseFunctions();
} catch (error) {
  console.error("Could not initialize Firebase Functions:", error);
}

const startWompiPayment = async (input: PaymentInput): Promise<PaymentResult> => {
    if (!functions) {
        throw new Error('El servicio de pagos no está disponible en este momento.');
    }

    if (input.healthCheck) {
        const wompiHealth = httpsCallable(functions, 'wompiHealth');
        await wompiHealth();
        return { status: 'APPROVED', reference: 'health-check', transactionId: 'health-check' }; // Dummy result
    }

    const createWompiTransaction = httpsCallable(functions, 'createWompiTransaction');
    
    try {
        const result: any = await createWompiTransaction({
            tramiteName: input.tramiteName,
            amountInCents: input.amountInCents,
            currency: 'COP',
            reference: input.reference,
            formData: input.formData,
            paymentMethod: {
                type: 'CARD', // This is a placeholder
                installments: 1,
            },
        });

        if (result.data.ok && result.data.transactionId) {
            // In a real scenario with a redirect, this part would be different.
            // Here, we simulate an immediate approval after creation for flow continuation.
            return {
                status: 'APPROVED',
                reference: result.data.transactionId,
                transactionId: result.data.wompiTransaction.id,
            };
        } else {
            throw new Error(result.data.error || 'Respuesta inesperada del servidor.');
        }
    } catch (error: any) {
        console.error('Wompi payment failed:', error);

        let description = 'Ocurrió un error desconocido al procesar el pago.';
        if (error.code && error.message) {
            const details = error.details as any;
            const requestId = details?.requestId;

            switch (error.code) {
                case 'invalid-argument':
                    description = 'Por favor, revisa los datos del pago e intenta de nuevo.';
                    break;
                case 'failed-precondition':
                    if (error.message === 'missing_wompi_private' || error.message === 'missing_config') {
                        description = 'El servicio de pago no está disponible temporalmente. Intenta más tarde.';
                    } else if (error.message === 'wompi_error') {
                        description = `No pudimos crear la transacción (código ${details?.status}). Intenta de nuevo.`;
                    }
                    break;
                case 'internal':
                    description = `Ocurrió un error inesperado. Si persiste, contacta a soporte. (ID: ${requestId || 'N/A'})`;
                    break;
            }
        }
        throw new Error(description);
    }
};

// This function is a placeholder for the mock logic which is handled in the component
// via modal. In a more complex scenario, this could trigger the modal via a context/event bus.
const startMockPayment = async (input: PaymentInput): Promise<PaymentResult> => {
  // The actual mock logic is in the component that opens the modal.
  // This function returning a promise is part of the adapter pattern,
  // but the promise will be resolved by the modal's user interaction.
  return new Promise(() => {});
};

export const startPayment = (input: PaymentInput): Promise<PaymentResult> => {
    const isMock = usePaymentMock();
    if (isMock && !input.healthCheck) {
        // The modal will resolve this, so we don't implement it here.
        // This is a bit of a pattern break but necessary for UI interaction.
        return startMockPayment(input);
    }
    return startWompiPayment(input);
};

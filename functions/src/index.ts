import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {z, ZodError} from 'zod';
import fetch from 'node-fetch';

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Define Zod schema for input validation
const WompiCallableRequestSchema = z.object({
  tramiteName: z.string(),
  amountInCents: z.number().positive(),
  currency: z.string().length(3),
  reference: z.string().min(6),
  formData: z.record(z.string(), z.any()),
  paymentMethod: z.any(), // In a real app, this would be more specific
});

// Define collection paths
const collections = {
  transactions: () => 'transactions',
  transaction: (id: string) => `transactions/${id}`,
};

export const createWompiTransaction = functions.https.onCall(
  async (data, context) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const log = (payload: any) => console.error('createWompiTransaction', {requestId, ...payload});
    
    const WOMPI_PRIVATE = functions.config().wompi?.private || process.env.WOMPI_PRIVATE;
    const WOMPI_URL = functions.config().wompi?.url || process.env.WOMPI_URL || 'https://sandbox.wompi.co/v1';
    
    if (!WOMPI_PRIVATE) {
      log({error: 'WOMPI_PRIVATE key is not configured.'});
      throw new functions.https.HttpsError(
        'failed-precondition',
        'missing_wompi_private',
        {requestId}
      );
    }

    try {
      // 1. Validate request body with Zod
      const validation = WompiCallableRequestSchema.parse(data);
      const {
        tramiteName,
        amountInCents,
        currency,
        reference,
        formData,
        paymentMethod,
      } = validation;

      // 2. Create a transaction document in Firestore for auditing
      const transactionRef = firestore.collection(collections.transactions()).doc(reference);
      const transactionId = transactionRef.id;

      await transactionRef.set({
        id: transactionId,
        uid: context.auth?.uid || null,
        tramiteName,
        amountInCents,
        currency,
        status: 'initiated',
        formData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Prepare and make the call to Wompi
      const wompiPayload = {
        amount_in_cents: amountInCents,
        currency,
        customer_email: formData.email || `user-${Date.now()}@example.com`,
        payment_method: paymentMethod,
        reference: transactionId,
      };

      const response = await fetch(`${WOMPI_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WOMPI_PRIVATE}`,
        },
        body: JSON.stringify(wompiPayload),
      });

      const wompiResult = (await response.json()) as any;

      if (!response.ok) {
        log({
          error: 'Wompi API error',
          status: response.status,
          body: wompiResult,
        });
        throw new functions.https.HttpsError(
          'failed-precondition',
          'wompi_error',
          {status: response.status, body: wompiResult, requestId}
        );
      }
      
      // 4. Update transaction with Wompi ID and new status
      await transactionRef.update({
        wompiId: wompiResult.data.id,
        status: 'created',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 5. Return a successful JSON response
      return {
        ok: true,
        message: 'Payment initiation started successfully.',
        transactionId: transactionId,
        wompiTransaction: wompiResult.data,
      };

    } catch (error: any) {
      if (error instanceof ZodError) {
        log({error: 'Invalid request body', issues: error.issues});
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid data provided.',
          {issues: error.issues, requestId}
        );
      }
      
      if (error instanceof functions.https.HttpsError) {
        // Re-throw HttpsError to be caught correctly by the client
        throw error;
      }

      log({error: 'Unexpected internal error', message: error.message, stack: error.stack});
      throw new functions.https.HttpsError('internal', 'unexpected_error', {
        message: error.message,
        requestId,
      });
    }
  }
);


export const wompiHealth = functions.https.onCall(async (data, context) => {
    const WOMPI_PRIVATE = functions.config().wompi?.private || process.env.WOMPI_PRIVATE;
    const WOMPI_URL = functions.config().wompi?.url || process.env.WOMPI_URL;

    if (!WOMPI_PRIVATE || !WOMPI_URL) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'missing_config'
        );
    }

    return {
        ok: true,
        url: WOMPI_URL,
        hasKey: !!WOMPI_PRIVATE,
    };
});

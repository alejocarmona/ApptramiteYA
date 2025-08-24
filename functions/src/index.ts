import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {z} from "zod";
import fetch from "node-fetch";

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Define Zod schema for input validation
const WompiCallableRequestSchema = z.object({
  tramiteName: z.string(),
  amountInCents: z.number().positive(),
  formData: z.record(z.string(), z.any()),
});

// Define collection paths
const collections = {
  transactions: () => "transactions",
  transaction: (id: string) => `transactions/${id}`,
};

// Define Transaction document type (mirroring frontend)
interface TransactionDoc {
  id?: string;
  tramiteId: string;
  tramiteName: string;
  amount: number; // amount in COP, not cents
  currency: string;
  status: "pending" | "paid" | "failed" | "delivered" | "cancelled";
  formData: Record<string, any>;
  wompiId?: string;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  paidAt?: admin.firestore.FieldValue;
  deliveredAt?: admin.firestore.FieldValue;
  cancelledAt?: admin.firestore.FieldValue;
  cancellationReason?: string;
}

export const createWompiTransaction = functions.https.onCall(
  async (data, context) => {
    // 1. Validate request body with Zod
    const validation = WompiCallableRequestSchema.safeParse(data);
    if (!validation.success) {
      console.error("Invalid request body:", validation.error.flatten());
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with the correct arguments.",
        validation.error.flatten().fieldErrors
      );
    }

    const {tramiteName, amountInCents, formData} = validation.data;
    const amountInCop = amountInCents / 100;

    // 2. Get Wompi credentials from Firebase config
    const wompiPrivateKey = functions.config().wompi.private;
    const wompiUrl = functions.config().wompi.url;

    if (!wompiPrivateKey || !wompiUrl) {
      console.error("Wompi credentials are not configured in Firebase.");
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The payment provider is not configured."
      );
    }

    // 3. Create a transaction document in Firestore
    const transactionRef = firestore.collection(collections.transactions()).doc();
    const transactionId = transactionRef.id;

    const newTransaction: TransactionDoc = {
      id: transactionId,
      tramiteId: tramiteName, // Assuming name is unique for now
      tramiteName,
      amount: amountInCop,
      formData,
      status: "pending",
      currency: "COP",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await transactionRef.set(newTransaction);
    
    // 4. Prepare and make the call to Wompi
    const wompiPayload = {
      amount_in_cents: amountInCents,
      currency: "COP",
      customer_email: formData.email || `user-${Date.now()}@example.com`,
      payment_method: {
        type: "CARD", // Example, would ideally come from client
        installments: 1,
      },
      reference: transactionId,
      // In a real app, you'd add customer_data, shipping_address, etc.
    };

    try {
      const response = await fetch(`${wompiUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${wompiPrivateKey}`,
        },
        body: JSON.stringify(wompiPayload),
      });

      const wompiResult = (await response.json()) as any;

      if (!response.ok) {
        console.error("Wompi API error:", wompiResult);
        const errorDetail =
          wompiResult?.error?.messages ||
          wompiResult?.error ||
          "Unknown Wompi error";
        // Optionally update Firestore doc to 'failed' here
        await transactionRef.update({
          status: "failed",
          cancellationReason: JSON.stringify(errorDetail),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        throw new functions.https.HttpsError(
          "aborted",
          "Payment provider rejected the transaction.",
          errorDetail
        );
      }

      // 5. Update transaction with Wompi ID
      await transactionRef.update({
        wompiId: wompiResult.data.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 6. Return a successful JSON response
      return {
        ok: true,
        message: "Payment initiation started successfully.",
        transactionId: transactionId,
        wompiTransaction: wompiResult.data,
      };
    } catch (error: any) {
      console.error("Error calling Wompi or processing transaction:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw HttpsError
      }
      throw new functions.https.HttpsError(
        "internal",
        "An internal error occurred while processing the payment.",
        error.message
      );
    }
  }
);

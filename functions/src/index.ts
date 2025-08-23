import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { z } from "zod";
import fetch from "node-fetch";

// Initialize Firebase Admin SDK
admin.initializeApp();
const firestore = admin.firestore();

// Define Zod schema for input validation
const WompiPaymentRequestSchema = z.object({
  tramiteId: z.string(),
  tramiteName: z.string(),
  amount: z.number().positive(),
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
  amount: number;
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

export const createWompiTransaction = functions.https.onRequest(
  async (request, response) => {
    // 1. Set CORS headers to allow requests from any origin
    response.set("Access-Control-Allow-Origin", "*");

    if (request.method === "OPTIONS") {
      // Pre-flight request. Reply successfully:
      response.set("Access-Control-Allow-Methods", "POST");
      response.set("Access-Control-Allow-Headers", "Content-Type, Accept");
      response.set("Access-Control-Max-Age", "3600");
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
        response.status(405).json({ error: "Method Not Allowed", detail: "Only POST requests are accepted." });
        return;
    }

    try {
      // 2. Validate request body
      const body = request.body;
      const validation = WompiPaymentRequestSchema.safeParse(body);

      if (!validation.success) {
        console.error("Invalid request body:", validation.error.flatten());
        response.status(400).json({
            error: "Bad Request",
            detail: validation.error.flatten().fieldErrors,
        });
        return;
      }

      const { tramiteId, tramiteName, amount, formData } = validation.data;

      // 3. Create a transaction document in Firestore
      const transactionsCollection = firestore.collection(
        collections.transactions()
      );
      const newTransaction: Omit<TransactionDoc, "id"> = {
        tramiteId,
        tramiteName,
        amount,
        formData,
        status: "pending",
        currency: "COP",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const docRef = await transactionsCollection.add(newTransaction);
      const transactionId = docRef.id;

      // 4. Prepare and make the call to Wompi (example, not fully implemented)
      // In a real scenario, you'd use the transactionId as reference_sale,
      // and construct the full Wompi payload.
      const wompiSecret = functions.config().wompi.private;
      if (!wompiSecret) {
        throw new Error("Wompi private key not configured in Firebase Functions.");
      }
      
      // This is a placeholder for the actual Wompi API call.
      // A real implementation would involve a proper `fetch` call to Wompi's API
      // and handling the response.
      console.log(`Simulating Wompi call for transaction: ${transactionId}`);
      
      // 5. Return a successful JSON response
      response.status(200).json({
        ok: true,
        message: "Payment initiation started successfully.",
        transactionId,
      });

    } catch (error) {
      console.error("Wompi payment initiation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      response.status(500).json({
        error: "Internal Server Error",
        detail: errorMessage,
      });
    }
  }
);

'use server';
import {z} from 'zod';
import {firestore} from '@/server/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';

// Note: Using a lightweight Zod-based schema. In a larger app,
// you might use a more robust solution like zod-to-json-schema.

/**
 * Base document schema for all Firestore documents.
 */
const BaseDocSchema = z.object({
  id: z.string(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

/**
 * Transaction document schema.
 * Represents a specific transaction for a trámite order.
 */
export const TransactionDocSchema = BaseDocSchema.extend({
  tramiteId: z.string(),
  tramiteName: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('COP'),
  status: z.enum(['pending', 'paid', 'failed', 'delivered']),
  formData: z.record(z.string(), z.any()),
  wompiId: z.string().optional(),
  paidAt: z.any().optional(),
  deliveredAt: z.any().optional(),
});
export type TransactionDoc = z.infer<typeof TransactionDocSchema>;

/**
 * Path builders for Firestore collections.
 * Ensures type-safe and consistent path creation.
 */
export const collections = {
  transactions: () => 'transactions',
  transaction: (id: string) => `transactions/${id}`,
};

/**
 * Creates a new transaction document in Firestore.
 * @param data The initial data for the transaction.
 * @returns The ID of the newly created document.
 */
export async function createTransaction(
  data: Pick<
    TransactionDoc,
    'tramiteId' | 'tramiteName' | 'amount' | 'formData'
  >
): Promise<string> {
  const transactionsCollection = collection(
    firestore,
    collections.transactions()
  );
  const newTransaction: Omit<TransactionDoc, 'id'> = {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(transactionsCollection, newTransaction);
  return docRef.id;
}

/**
 * Updates a transaction document upon successful payment.
 * @param transactionId The ID of the transaction to update.
 * @param wompiId The transaction ID from Wompi.
 */
export async function markTransactionAsPaid(
  transactionId: string,
  wompiId: string
) {
  const transactionRef = doc(
    firestore,
    collections.transaction(transactionId)
  );
  await updateDoc(transactionRef, {
    status: 'paid',
    wompiId,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates a transaction document upon document delivery.
 * @param transactionId The ID of the transaction to update.
 */
export async function markTransactionAsDelivered(transactionId: string) {
  const transactionRef = doc(
    firestore,
    collections.transaction(transactionId)
  );
  await updateDoc(transactionRef, {
    status: 'delivered',
    deliveredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

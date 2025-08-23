'use server';
import {firestore} from '@/server/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type {TransactionDoc} from './schema';
import {collections} from './schema';

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

/**
 * Cancels a transaction document.
 * @param transactionId The ID of the transaction to cancel.
 * @param reason Optional reason for cancellation.
 */
export async function cancelTransaction(
  transactionId: string,
  reason?: string
) {
  const transactionRef = doc(
    firestore,
    collections.transaction(transactionId)
  );
  await updateDoc(transactionRef, {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
    cancellationReason: reason || 'cancelled_by_user',
    updatedAt: serverTimestamp(),
  });
}

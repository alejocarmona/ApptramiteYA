'use server';
import {z} from 'zod';

/**
 * Base document schema for all Firestore documents.
 */
export const BaseDocSchema = z.object({
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
  status: z.enum(['pending', 'paid', 'failed', 'delivered', 'cancelled']),
  formData: z.record(z.string(), z.any()),
  wompiId: z.string().optional(),
  paidAt: z.any().optional(),
  deliveredAt: z.any().optional(),
  cancelledAt: z.any().optional(),
  cancellationReason: z.string().optional(),
});
export type TransactionDoc = z.infer<typeof TransactionDocSchema>;

export type FlowStep = 1 | 2 | 3 | 4;
export type FlowStatus =
  | 'idle'
  | 'selecting'
  | 'filling'
  | 'paying'
  | 'generating'
  | 'completed'
  | 'cancelled';

export interface FlowContext {
  step: FlowStep;
  status: FlowStatus;
  tramiteId?: string;
  transactionId?: string; // Changed from orderId to transactionId
}

export const initialFlow: FlowContext = {step: 1, status: 'selecting'};

/**
 * Path builders for Firestore collections.
 * Ensures type-safe and consistent path creation.
 */
export const collections = {
  transactions: () => 'transactions',
  transaction: (id: string) => `transactions/${id}`,
};

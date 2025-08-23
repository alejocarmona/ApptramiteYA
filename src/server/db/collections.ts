import {z} from 'zod';

// Note: Using a lightweight Zod-based schema. In a larger app,
// you might use a more robust solution like zod-to-json-schema.

/**
 * Base document schema for all Firestore documents.
 */
const BaseDocSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * User document schema.
 * Represents a user in the application.
 */
export const UserDocSchema = BaseDocSchema.extend({
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  // other user fields...
});
export type UserDoc = z.infer<typeof UserDocSchema>;

/**
 * Order document schema.
 * Represents a specific trámite order placed by a user.
 */
export const OrderDocSchema = BaseDocSchema.extend({
  userId: z.string(),
  tramiteId: z.string(),
  status: z.enum(['pending', 'approved', 'declined', 'error', 'completed']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  paymentProvider: z.enum(['wompi']),
  transactionId: z.string().optional(),
  reconciledAt: z.date().optional().nullable(),
  formData: z.record(z.string(), z.any()),
});
export type OrderDoc = z.infer<typeof OrderDocSchema>;

/**
 * Tramite document schema.
 * Represents an available trámite that can be purchased.
 * Could be seeded from a config file or managed via an admin panel.
 */
export const TramiteDocSchema = BaseDocSchema.extend({
  name: z.string(),
  description: z.string(),
  priceCop: z.number().positive(),
  // ... other trámite-specific fields
});
export type TramiteDoc = z.infer<typeof TramiteDocSchema>;

/**
 * Path builders for Firestore collections.
 * Ensures type-safe and consistent path creation.
 */
export const collections = {
  users: () => 'users',
  user: (id: string) => `users/${id}`,
  orders: (userId: string) => `users/${userId}/orders`,
  order: (userId: string, orderId: string) =>
    `users/${userId}/orders/${orderId}`,
  tramites: () => 'tramites',
  tramite: (id: string) => `tramites/${id}`,
};

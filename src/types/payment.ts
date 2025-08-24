
export type PaymentStatus =
  | "APPROVED"
  | "DECLINED"
  | "CANCELLED"
  | "ERROR";

export type PaymentResult = {
  status: PaymentStatus;
  reference: string;
  transactionId: string;
  reason?: string;
};

export type PaymentInput = {
    tramiteId: string;
    tramiteName: string;
    amountInCents: number;
    currency: 'COP';
    formData: Record<string, string>;
}

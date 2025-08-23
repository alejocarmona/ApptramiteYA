import {NextRequest, NextResponse} from 'next/server';
import {markTransactionAsPaid} from '@/server/db/collections';

// This is a mock webhook handler. In a real application, you would:
// 1. Verify the signature of the webhook event to ensure it's from Wompi.
// 2. Extract the transaction ID and other relevant data from the event payload.
// 3. Implement more robust error handling.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // In a real scenario, you'd get the transactionId from the webhook payload.
    // For this example, we'll assume it's passed directly for simulation purposes.
    const {transactionId, wompiId} = body.data.transaction;

    if (!transactionId || !wompiId) {
      return NextResponse.json(
        {success: false, message: 'Missing transaction details'},
        {status: 400}
      );
    }

    // Update the transaction status in Firestore
    await markTransactionAsPaid(transactionId, wompiId);

    return NextResponse.json({success: true, message: 'Webhook processed'});
  } catch (error) {
    console.error('Wompi webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {success: false, message: 'Internal Server Error', error: errorMessage},
      {status: 500}
    );
  }
}

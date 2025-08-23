'use server';

import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';
import {createTransaction} from '@/server/db/collections';
import {env} from '@/config/env';

// 1. Define Zod schema for input validation
const WompiPaymentRequestSchema = z.object({
  tramiteId: z.string(),
  tramiteName: z.string(),
  amount: z.number().positive(),
  formData: z.record(z.string(), z.any()),
});

export async function POST(req: NextRequest) {
  try {
    // 2. Validate request body
    const body = await req.json();
    const validation = WompiPaymentRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error('Invalid request body:', validation.error.flatten());
      return NextResponse.json(
        {
          error: 'Bad Request',
          detail: validation.error.flatten().fieldErrors,
        },
        {status: 400}
      );
    }

    const {tramiteId, tramiteName, amount, formData} = validation.data;

    // 3. Create a transaction document in Firestore before calling Wompi
    const transactionId = await createTransaction({
      tramiteId,
      tramiteName,
      amount,
      formData,
    });
    
    // In a real scenario, you would now make a fetch call to Wompi's API
    // using the WOMPI_SECRET from env vars and the data received.
    // For this example, we will simulate a successful call.
    //
    // const wompiResponse = await fetch(env.WOMPI_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${env.WOMPI_SECRET}`
    //   },
    //   body: JSON.stringify({ ... })
    // });
    //
    // if (!wompiResponse.ok) {
    //   // Handle Wompi API errors
    // }

    // 4. Return a clear JSON response
    return NextResponse.json({
      ok: true,
      message: 'Payment initiation started successfully.',
      transactionId,
    });
  } catch (error) {
    // 5. Log errors and return a generic server error response
    console.error('Wompi payment initiation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        detail: errorMessage,
      },
      {status: 500}
    );
  }
}

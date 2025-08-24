# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

To run this project locally, you will need to create a `.env` file in the root of your project and add the following environment variables.

### Firebase Client SDK
These are required for the application to connect to your Firebase project on the client-side. You can get these from the Firebase console in your project's settings.

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Genkit / Gemini AI
This is required for the AI features to work.

```
GEMINI_API_KEY=
```

### Payment Configuration

#### Feature Flag for Mock Payments
This flag allows you to switch between the real Wompi payment service and a local mock for testing purposes.
- Set to `"true"` to use the mock payment modal.
- Set to `"false"` to use the real Wompi integration.

```
NEXT_PUBLIC_USE_PAYMENT_MOCK="true"
```

#### Wompi Payments (For Emulator/Local Development Only)
These variables are used for local development when running the Firebase Emulator Suite with the **real** Wompi service (`NEXT_PUBLIC_USE_PAYMENT_MOCK="false"`). In production, these values are set via Firebase Functions configuration.

```
WOMPI_PRIVATE=prv_test_your_sandbox_key_here
WOMPI_URL=https://sandbox.wompi.co/v1
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, while others are only available on the server. Make sure to keep your secret keys private and never expose them on the client side.

## Firebase Functions Configuration (Production)

Payment processing is handled by a Firebase Cloud Function (`createWompiTransaction`) to securely use the Wompi private key. You need to set this configuration in your Firebase project for deployment.

The functions are deployed in the **`us-central1`** region. If your project uses a different region, you must update it in `src/lib/firebase.ts`.

Run the following commands in your terminal, replacing the placeholder values with your actual Wompi credentials:

### Sandbox/Testing Environment
```bash
firebase functions:config:set wompi.private="prv_test_YOUR_WOMPI_SANDBOX_PRIVATE_KEY" wompi.url="https://sandbox.wompi.co/v1"
```

### Production Environment
For a production environment, change the URL to Wompi's production endpoint and use your production private key:
```bash
firebase functions:config:set wompi.private="prv_prod_YOUR_WOMPI_PRODUCTION_PRIVATE_KEY" wompi.url="https://production.wompi.co/v1"
```

After setting the configuration, deploy your functions. Make sure you are deploying to the correct region (e.g., `us-central1`).

```bash
firebase deploy --only functions
```

The frontend application calls this function directly using the Firebase Functions SDK. The function's region must be specified correctly on the client-side in `src/lib/firebase.ts`.

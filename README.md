# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

To run this project locally, you will need to create a `.env` file in the root of your project and add the following environment variables:

### Firebase
These are required for the application to connect to your Firebase project. You can get these from the Firebase console in your project's settings.

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

### Wompi Payments
These are required for the payment processing to work.

```
# This is your PUBLIC key for the Wompi API, safe to be on the client.
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, while others are only available on the server. Make sure to keep your secret keys private and never expose them on the client side.

## Firebase Functions Configuration

Payment processing is handled by a Firebase Cloud Function (`createWompiTransaction`) to securely use the Wompi private key. You need to set this configuration in your Firebase project.

Run the following commands in your terminal, replacing the placeholder values with your actual Wompi credentials:

```bash
firebase functions:config:set wompi.private="YOUR_WOMPI_PRIVATE_KEY" wompi.url="https://sandbox.wompi.co/v1/transactions"
```

For a production environment, change the URL to Wompi's production endpoint:

```bash
firebase functions:config:set wompi.private="YOUR_WOMPI_PRODUCTION_PRIVATE_KEY" wompi.url="https://production.wompi.co/v1/transactions"
```

After setting the configuration, deploy your functions:

```bash
firebase deploy --only functions
```

The frontend application will call this function directly. The function URL is constructed dynamically using your `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.

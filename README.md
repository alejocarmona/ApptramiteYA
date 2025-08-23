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
WOMPI_SECRET=
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, while others are only available on the server. Make sure to keep your secret keys private and never expose them on the client side.

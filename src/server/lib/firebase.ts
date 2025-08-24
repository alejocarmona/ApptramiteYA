import {initializeApp, getApps, getApp, ServiceAccount, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

// This file is intended for SERVER-SIDE use only.

const apps = getApps();

// Ensure environment variables are only read on the server
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

let app;
if (!apps.length) {
  if (privateKey && clientEmail) {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: clientEmail,
      privateKey: privateKey,
    };
    app = initializeApp({credential: cert(serviceAccount)});
  } else {
    console.warn(
      'Firebase Admin SDK not initialized. Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL.'
    );
    // In a development environment without service account credentials,
    // we can initialize a default app instance to avoid crashes,
    // but server-side Firebase services will not be authenticated.
    app = initializeApp();
  }
} else {
  app = getApp();
}

const firestore = getFirestore(app);

export {app, firestore};

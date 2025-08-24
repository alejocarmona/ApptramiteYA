'use client';
// This file is intended for client-side use only.

import {env} from '@/config/env';
import {getApp, getApps, initializeApp, type FirebaseApp} from 'firebase/app';
import {getFunctions, type Functions} from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// IMPORTANT: Replace with the region where your functions are deployed
const FIREBASE_REGION = 'us-central1';

/**
 * Returns the initialized Firebase App instance, creating it if it doesn't exist.
 * This singleton pattern ensures that Firebase is only initialized once on the client.
 * @returns {FirebaseApp} The initialized Firebase App.
 */
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

/**
 * Returns a Firebase Functions instance for the specified region.
 * This function ensures the Firebase app is initialized before getting the Functions instance.
 * @returns {Functions} The Firebase Functions service instance.
 */
export function getFirebaseFunctions(): Functions {
  const app = getFirebaseApp();
  return getFunctions(app, FIREBASE_REGION);
}

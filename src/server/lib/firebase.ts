import {initializeApp, getApps, getApp, ServiceAccount, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

// This file is intended for SERVER-SIDE use only.

const apps = getApps();

// Ensure environment variables are only read on the server
const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = !apps.length ? initializeApp({ credential: cert(serviceAccount) }) : getApp();
const firestore = getFirestore(app);

export {app, firestore};

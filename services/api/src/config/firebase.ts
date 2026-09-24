import admin from 'firebase-admin';
import pino from 'pino';

const logger = pino({ name: 'firebase-admin' });

let isInitialized = false;

export function initFirebaseAdmin(): typeof admin {
  if (isInitialized || admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isInitialized = true;
      logger.info('Firebase Admin SDK initialized successfully.');
    } catch (err) {
      logger.warn(`Firebase Admin initialization error: ${(err as Error).message}`);
    }
  } else {
    // Development fallback
    try {
      admin.initializeApp({
        projectId: 'swaraj-digital-dev',
      });
      isInitialized = true;
      logger.info('Firebase Admin initialized in local development stub mode.');
    } catch (err) {
      // Already initialized
    }
  }

  return admin;
}

export const firebaseAdmin = initFirebaseAdmin();

"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyDpR3PEAEskSCZ7fpvuEi6EBFMoB0UZ6Yw",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "space-tribes.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "space-tribes",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "space-tribes.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "259546833788",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:259546833788:web:22ae17ff32c2c60269baf9",
};

export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
);

const app = firebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;

let identityPromise: Promise<User> | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out. Check your connection and try again.`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function ensurePlayerIdentity(): Promise<User> {
  if (!firebaseAuth) {
    throw new Error("Firebase is not configured yet.");
  }
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  if (identityPromise) return identityPromise;

  identityPromise = (async () => {
    // Embedded browsers (ChatGPT / Sites) sometimes block durable storage.
    // Fall back to in-memory persistence instead of hanging forever.
    try {
      await setPersistence(firebaseAuth, browserLocalPersistence);
    } catch {
      await setPersistence(firebaseAuth, inMemoryPersistence);
    }

    const restored = await withTimeout(
      new Promise<User | null>((resolve) => {
        const stop = onAuthStateChanged(firebaseAuth, (user) => {
          stop();
          resolve(user);
        });
      }),
      12000,
      "Signing in",
    );
    if (restored) return restored;

    try {
      const credential = await withTimeout(
        signInAnonymously(firebaseAuth),
        12000,
        "Anonymous sign-in",
      );
      return credential.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/admin-restricted-operation|operation-not-allowed/i.test(message)) {
        throw new Error(
          "Anonymous sign-in is turned off in the Firebase project. Enable Authentication → Sign-in method → Anonymous.",
        );
      }
      if (/unauthorized-domain/i.test(message)) {
        throw new Error(
          "This site’s domain is not authorized for Firebase Auth. Add it under Authentication → Settings → Authorized domains.",
        );
      }
      throw error instanceof Error ? error : new Error(message);
    }
  })();

  try {
    return await identityPromise;
  } finally {
    identityPromise = null;
  }
}

export function commanderName(): string {
  if (typeof window === "undefined") return "Commander";
  return localStorage.getItem("fleet-dice-commander-name") || "Commander";
}

export function rememberCommanderName(name: string) {
  if (typeof window === "undefined") return;
  const cleaned = name.trim().slice(0, 24) || "Commander";
  localStorage.setItem("fleet-dice-commander-name", cleaned);
}

"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { ensurePlayerIdentity, firestore } from "./firebase";
import {
  applyAction,
  joinMatch,
  newMatch,
  publicMatchView,
  roleFor,
  type MatchAction,
  type MatchState,
  type SideId,
} from "./game";

type MatchDocument = {
  code: string;
  hostUid: string;
  guestUid: string | null;
  status: MatchState["status"];
  state: MatchState;
  version: number;
};

export type LiveMatch = {
  id: string;
  side: SideId;
  state: MatchState;
  version: number;
};

export async function createLiveMatch(name: string): Promise<{
  match: LiveMatch;
  invitePath: string;
}> {
  const db = requireDb();
  const user = await ensurePlayerIdentity();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const matchRef = doc(collection(db, "matches"));
    const code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const codeRef = doc(db, "codes", code);
    const state = newMatch(matchRef.id, code, matchRef.id, user.uid, name);

    try {
      await runTransaction(db, async (transaction) => {
        const existingCode = await transaction.get(codeRef);
        if (existingCode.exists()) throw new CodeCollisionError();
        transaction.set(codeRef, {
          matchId: matchRef.id,
          hostUid: user.uid,
          createdAt: serverTimestamp(),
        });
        transaction.set(matchRef, {
          code,
          hostUid: user.uid,
          guestUid: null,
          status: state.status,
          state,
          version: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      return {
        match: {
          id: matchRef.id,
          side: "host",
          state,
          version: 1,
        },
        invitePath: `/join/?id=${encodeURIComponent(matchRef.id)}`,
      };
    } catch (error) {
      if (error instanceof CodeCollisionError) continue;
      throw error;
    }
  }

  throw new Error("Every room code was busy. Try again.");
}

export async function joinLiveMatch(matchId: string, name: string): Promise<LiveMatch> {
  const db = requireDb();
  const user = await ensurePlayerIdentity();
  const matchRef = doc(db, "matches", matchId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(matchRef);
    if (!snapshot.exists()) throw new Error("That match no longer exists.");
    const data = snapshot.data() as MatchDocument;
    const state = structuredClone(data.state);
    const currentRole = roleFor(state, user.uid);
    if (!currentRole) joinMatch(state, user.uid, name);
    const side = roleFor(state, user.uid);
    if (!side) throw new Error("This match already has two commanders.");
    const version = data.version + (currentRole ? 0 : 1);
    if (!currentRole) {
      transaction.update(matchRef, {
        guestUid: user.uid,
        status: state.status,
        state,
        version,
        updatedAt: serverTimestamp(),
      });
    }
    return {
      id: matchId,
      side,
      state: publicMatchView(state, side),
      version,
    };
  });
}

export async function joinLiveMatchByCode(code: string, name: string): Promise<LiveMatch> {
  const db = requireDb();
  await ensurePlayerIdentity();
  const cleaned = code.replace(/\D/g, "").padStart(4, "0").slice(-4);
  const codeSnapshot = await getDoc(doc(db, "codes", cleaned));
  if (!codeSnapshot.exists()) throw new Error("That four-digit game code was not found.");
  return joinLiveMatch(String(codeSnapshot.data().matchId), name);
}

export async function playLiveAction(
  matchId: string,
  action: MatchAction,
): Promise<LiveMatch> {
  const db = requireDb();
  const user = await ensurePlayerIdentity();
  const matchRef = doc(db, "matches", matchId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(matchRef);
    if (!snapshot.exists()) throw new Error("That match no longer exists.");
    const data = snapshot.data() as MatchDocument;
    const state = structuredClone(data.state);
    const side = roleFor(state, user.uid);
    if (!side) throw new Error("You are not a commander in this match.");
    applyAction(state, side, action);
    const version = data.version + 1;
    transaction.update(matchRef, {
      status: state.status,
      state,
      version,
      updatedAt: serverTimestamp(),
    });
    return {
      id: matchId,
      side,
      state: publicMatchView(state, side),
      version,
    };
  });
}

export async function watchLiveMatch(
  matchId: string,
  onMatch: (match: LiveMatch) => void,
  onError: (error: Error) => void,
): Promise<Unsubscribe> {
  if (!matchId) {
    throw new Error("This match link is missing its room id.");
  }
  const db = requireDb();
  const user = await ensurePlayerIdentity();
  return onSnapshot(
    doc(db, "matches", matchId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onError(new Error("That match no longer exists."));
        return;
      }
      const data = snapshot.data() as MatchDocument;
      const side = roleFor(data.state, user.uid);
      if (!side) {
        onError(
          new Error(
            data.status === "waiting"
              ? "Open the invite link and tap Join match before entering the battlefield."
              : "You are not a commander in this match. Use the invite link from the host.",
          ),
        );
        return;
      }
      onMatch({
        id: matchId,
        side,
        state: publicMatchView(data.state, side),
        version: data.version,
      });
    },
    (error) => {
      const code = "code" in error ? String(error.code) : "";
      if (code.includes("permission-denied") || /insufficient permissions/i.test(error.message)) {
        onError(
          new Error(
            "Firebase blocked reading this match. Confirm you joined with the invite link, and that Firestore rules are deployed.",
          ),
        );
        return;
      }
      onError(error);
    },
  );
}

function requireDb() {
  if (!firestore) throw new Error("Firebase is not configured yet.");
  return firestore;
}

class CodeCollisionError extends Error {}

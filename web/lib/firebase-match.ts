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

export type LiveBattleRow = {
  id: string;
  hostName: string;
  guestName: string | null;
  status: "waiting" | "active";
  round: number;
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
    const boardRef = doc(db, "liveBattles", matchRef.id);
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
        transaction.set(boardRef, {
          hostName: state.players.host.name,
          guestName: null,
          status: "waiting",
          round: state.round,
          hostUid: user.uid,
          guestUid: null,
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
  const boardRef = doc(db, "liveBattles", matchId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(matchRef);
    const boardSnap = await transaction.get(boardRef);
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
      const boardPayload = {
        hostName: state.players.host.name,
        guestName: state.players.guest?.name ?? name,
        status: "active" as const,
        round: state.round,
        hostUid: data.hostUid,
        guestUid: user.uid,
        updatedAt: serverTimestamp(),
      };
      if (boardSnap.exists()) {
        transaction.update(boardRef, boardPayload);
      } else {
        transaction.set(boardRef, boardPayload);
      }
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
  const boardRef = doc(db, "liveBattles", matchId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(matchRef);
    const boardSnap = await transaction.get(boardRef);
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
    if (state.status === "finished") {
      if (boardSnap.exists()) transaction.delete(boardRef);
    } else if (boardSnap.exists()) {
      transaction.update(boardRef, {
        round: state.round,
        status: "active",
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

export async function cancelLiveMatch(matchId: string): Promise<void> {
  const db = requireDb();
  const user = await ensurePlayerIdentity();
  const matchRef = doc(db, "matches", matchId);
  const boardRef = doc(db, "liveBattles", matchId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(matchRef);
    const boardSnap = await transaction.get(boardRef);
    if (!snapshot.exists()) throw new Error("That match no longer exists.");
    const data = snapshot.data() as MatchDocument;
    const state = structuredClone(data.state);
    const side = roleFor(state, user.uid);
    if (!side) throw new Error("You are not a commander in this match.");
    if (state.status === "finished") return;

    const canceller = state.players[side]!.name;
    state.status = "finished";
    state.winner = null;
    state.cancelledBy = canceller;
    state.players.host.phase = "over";
    if (state.players.guest) state.players.guest.phase = "over";

    const codeRef = doc(db, "codes", state.code);
    const codeSnap = await transaction.get(codeRef);

    transaction.update(matchRef, {
      status: "finished",
      state,
      version: data.version + 1,
      updatedAt: serverTimestamp(),
    });
    if (boardSnap.exists()) transaction.delete(boardRef);
    if (codeSnap.exists() && data.hostUid === user.uid) {
      transaction.delete(codeRef);
    }
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
      try {
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
      } catch (reason) {
        onError(reason instanceof Error ? reason : new Error(String(reason)));
      }
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

/** Home-page scoreboard: public names of waiting and active battles. */
export function watchLiveBattles(
  onRows: (rows: LiveBattleRow[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(
    collection(db, "liveBattles"),
    (snapshot) => {
      const rows: LiveBattleRow[] = snapshot.docs
        .map((entry) => {
          const data = entry.data();
          const status: LiveBattleRow["status"] =
            data.status === "active" ? "active" : "waiting";
          return {
            id: entry.id,
            hostName: String(data.hostName || "Commander"),
            guestName: data.guestName ? String(data.guestName) : null,
            status,
            round: Number(data.round) || 1,
          } satisfies LiveBattleRow;
        })
        .filter((row) => row.status === "waiting" || row.status === "active")
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === "active" ? -1 : 1;
          return a.hostName.localeCompare(b.hostName);
        });
      onRows(rows);
    },
    (error) => {
      onError(error instanceof Error ? error : new Error(String(error)));
    },
  );
}

function requireDb() {
  if (!firestore) throw new Error("Firebase is not configured yet.");
  return firestore;
}

class CodeCollisionError extends Error {}

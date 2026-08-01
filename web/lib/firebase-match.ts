"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
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

type CodeDocument = {
  matchId: string;
  hostUid: string;
  guestUid?: string | null;
  status?: "waiting" | "active" | "finished";
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

export type BattleResultRow = {
  id: string;
  winnerName: string;
  loserName: string;
  finishedAt: Date;
};

export type RememberedMatchCard = {
  id: string;
  code: string;
  side: SideId;
  status: MatchState["status"];
  round: number;
  youName: string;
  enemyName: string | null;
};

const ACTIVE_MATCH_KEY = "fleet-dice-active-match";
const ACTIVE_MATCHES_KEY = "fleet-dice-active-matches";
const MAX_REMEMBERED_MATCHES = 6;

function readRememberedMatchIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVE_MATCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.filter((value): value is string => typeof value === "string" && value.length > 0))];
      }
    }
  } catch {
    // Fall through to legacy single-id storage.
  }
  const legacy = localStorage.getItem(ACTIVE_MATCH_KEY);
  return legacy ? [legacy] : [];
}

function writeRememberedMatchIds(ids: string[]) {
  if (typeof window === "undefined") return;
  const next = [...new Set(ids.filter(Boolean))].slice(0, MAX_REMEMBERED_MATCHES);
  if (!next.length) {
    localStorage.removeItem(ACTIVE_MATCHES_KEY);
    localStorage.removeItem(ACTIVE_MATCH_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_MATCHES_KEY, JSON.stringify(next));
  localStorage.setItem(ACTIVE_MATCH_KEY, next[0]!);
}

/** Remember a live room. Newest match stays first so Continue still works. */
export function rememberActiveMatch(matchId: string) {
  if (typeof window === "undefined" || !matchId) return;
  writeRememberedMatchIds([matchId, ...readRememberedMatchIds().filter((id) => id !== matchId)]);
}

/** Forget one room, or all remembered rooms if no id is passed. */
export function clearActiveMatch(matchId?: string) {
  if (typeof window === "undefined") return;
  if (!matchId) {
    writeRememberedMatchIds([]);
    return;
  }
  writeRememberedMatchIds(readRememberedMatchIds().filter((id) => id !== matchId));
}

/** Most recently opened remembered match id (legacy helper). */
export function rememberedActiveMatch(): string | null {
  return readRememberedMatchIds()[0] ?? null;
}

/** All remembered live match ids, newest first. */
export function rememberedMatchIds(): string[] {
  return readRememberedMatchIds();
}

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
          guestUid: null,
          status: "waiting",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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

      rememberActiveMatch(matchRef.id);
      return {
        match: {
          id: matchRef.id,
          side: "host",
          state,
          version: 1,
        },
        invitePath: `/join/?id=${encodeURIComponent(matchRef.id)}&code=${code}`,
      };
    } catch (error) {
      if (error instanceof CodeCollisionError) continue;
      throw error;
    }
  }

  throw new Error("Every room code was busy. Try again.");
}

/** Re-open a match you already belong to (host or guest). */
export async function enterLiveMatch(
  matchId: string,
  options: { remember?: boolean } = {},
): Promise<LiveMatch> {
  const remember = options.remember !== false;
  const db = requireDb();
  const user = await ensurePlayerIdentity();
  try {
    const snapshot = await getDoc(doc(db, "matches", matchId));
    if (!snapshot.exists()) {
      clearActiveMatch(matchId);
      throw new Error("That match no longer exists.");
    }
    const data = snapshot.data() as MatchDocument;
    const side = roleFor(data.state, user.uid);
    if (!side) {
      throw new Error(
        data.status === "waiting"
          ? "Open the invite link and tap Join match before entering the battlefield."
          : ROOM_FULL_MESSAGE,
      );
    }
    if (data.status === "finished" || data.state.status === "finished") {
      clearActiveMatch(matchId);
    } else if (remember) {
      rememberActiveMatch(matchId);
    }
    return {
      id: matchId,
      side,
      state: publicMatchView(data.state, side),
      version: data.version,
    };
  } catch (error) {
    throw friendlyJoinError(error);
  }
}

/** Refresh remembered rooms for the home list. Drops finished or invalid ones. */
export async function loadRememberedMatchCards(): Promise<RememberedMatchCard[]> {
  const ids = rememberedMatchIds();
  if (!ids.length) return [];

  const cards: RememberedMatchCard[] = [];
  for (const id of ids) {
    try {
      const match = await enterLiveMatch(id, { remember: false });
      if (match.state.status === "finished") {
        clearActiveMatch(id);
        continue;
      }
      const you = match.state.players[match.side]!;
      const enemy = match.state.players[match.side === "host" ? "guest" : "host"];
      cards.push({
        id: match.id,
        code: match.state.code,
        side: match.side,
        status: match.state.status,
        round: you.round,
        youName: you.name,
        enemyName: enemy?.name ?? null,
      });
    } catch {
      clearActiveMatch(id);
    }
  }
  return cards;
}

export async function joinLiveMatch(matchId: string, name: string): Promise<LiveMatch> {
  const db = requireDb();
  const user = await ensurePlayerIdentity();
  const matchRef = doc(db, "matches", matchId);
  const boardRef = doc(db, "liveBattles", matchId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(matchRef);
      const boardSnap = await transaction.get(boardRef);
      if (!snapshot.exists()) throw new Error("That match no longer exists.");
      const data = snapshot.data() as MatchDocument;
      const state = structuredClone(data.state);
      const currentRole = roleFor(state, user.uid);
      if (!currentRole) joinMatch(state, user.uid, name);
      const side = roleFor(state, user.uid);
      if (!side) throw new Error(ROOM_FULL_MESSAGE);
      const version = data.version + (currentRole ? 0 : 1);
      if (!currentRole) {
        const codeRef = doc(db, "codes", state.code);
        const codeSnap = await transaction.get(codeRef);
        transaction.update(matchRef, {
          guestUid: user.uid,
          status: state.status,
          state,
          version,
          updatedAt: serverTimestamp(),
        });
        if (codeSnap.exists()) {
          transaction.update(codeRef, {
            guestUid: user.uid,
            status: "active",
            updatedAt: serverTimestamp(),
          });
        }
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
    rememberActiveMatch(matchId);
    return result;
  } catch (error) {
    throw friendlyJoinError(error);
  }
}

export async function joinLiveMatchByCode(code: string, name: string): Promise<LiveMatch> {
  const db = requireDb();
  const user = await ensurePlayerIdentity();
  const cleaned = code.replace(/\D/g, "").padStart(4, "0").slice(-4);
  if (cleaned.length !== 4) {
    throw new Error("Enter all four numbers from the host’s screen.");
  }
  const codeSnapshot = await getDoc(doc(db, "codes", cleaned));
  if (!codeSnapshot.exists()) {
    throw new Error("That four-digit game code was not found. Check the numbers on the host’s screen.");
  }

  const codeData = codeSnapshot.data() as CodeDocument;
  const matchId = String(codeData.matchId);

  // Prefer the match document for seating — code docs can lag or get out of sync.
  const matchSnapshot = await getDoc(doc(db, "matches", matchId));
  if (!matchSnapshot.exists()) {
    throw new Error("That room no longer exists. Ask the host to create a new match.");
  }
  const matchData = matchSnapshot.data() as MatchDocument;
  const existingSide = roleFor(matchData.state, user.uid);
  if (existingSide) {
    return enterLiveMatch(matchId);
  }

  if (matchData.status === "finished" || matchData.state.status === "finished") {
    throw new Error("That match is already over. Create or join a new room.");
  }

  if (matchData.status === "waiting" && !matchData.guestUid && !matchData.state.players.guest) {
    return joinLiveMatch(matchId, name);
  }

  if (codeData.hostUid === user.uid || codeData.guestUid === user.uid) {
    return enterLiveMatch(matchId);
  }

  throw new Error(
    "That room already has two players. If you created the game, reopen it from Your matches on this same phone/browser — a new Safari tab or cleared data makes a new identity and looks like a third player.",
  );
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
    const codeRef = doc(db, "codes", state.code);
    const codeSnap = await transaction.get(codeRef);

    transaction.update(matchRef, {
      status: state.status,
      state,
      version,
      updatedAt: serverTimestamp(),
    });
    if (state.status === "finished") {
      clearActiveMatch(matchId);
      if (boardSnap.exists()) transaction.delete(boardRef);
      if (
        (state.winner === "host" || state.winner === "guest")
        && state.players.guest
      ) {
        const loserSide: SideId = state.winner === "host" ? "guest" : "host";
        transaction.set(doc(db, "battleResults", matchId), {
          winnerName: state.players[state.winner]!.name,
          loserName: state.players[loserSide]!.name,
          finishedAt: serverTimestamp(),
        });
      }
      if (codeSnap.exists() && data.hostUid === user.uid) {
        transaction.delete(codeRef);
      } else if (codeSnap.exists()) {
        transaction.update(codeRef, {
          status: "finished",
          updatedAt: serverTimestamp(),
        });
      }
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
  clearActiveMatch(matchId);
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
          clearActiveMatch(matchId);
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
                : ROOM_FULL_MESSAGE,
            ),
          );
          return;
        }
        if (data.status === "finished" || data.state.status === "finished") {
          clearActiveMatch(matchId);
        } else {
          rememberActiveMatch(matchId);
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
        onError(new Error(ROOM_FULL_MESSAGE));
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

/** Public, name-only results from completed versus matches in the last 30 days. */
export function watchRecentBattleResults(
  onRows: (rows: BattleResultRow[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = requireDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recentResults = query(
    collection(db, "battleResults"),
    where("finishedAt", ">=", Timestamp.fromDate(cutoff)),
    orderBy("finishedAt", "desc"),
  );
  return onSnapshot(
    recentResults,
    (snapshot) => {
      const rows = snapshot.docs.flatMap((entry) => {
        const data = entry.data();
        const finishedAt = data.finishedAt?.toDate?.();
        if (!(finishedAt instanceof Date)) return [];
        return [{
          id: entry.id,
          winnerName: String(data.winnerName || "Commander"),
          loserName: String(data.loserName || "Commander"),
          finishedAt,
        } satisfies BattleResultRow];
      });
      onRows(rows);
    },
    (error) => {
      onError(error instanceof Error ? error : new Error(String(error)));
    },
  );
}

const ROOM_FULL_MESSAGE =
  "That room already has two players. If you created the game, reopen it from Your matches on this same phone/browser — only your friend should use the invite code.";

function friendlyJoinError(error: unknown): Error {
  if (!(error instanceof Error)) return new Error(String(error));
  if (/Missing or insufficient permissions|permission-denied/i.test(error.message)) {
    return new Error(ROOM_FULL_MESSAGE);
  }
  return error;
}

function requireDb() {
  if (!firestore) throw new Error("Firebase is not configured yet.");
  return firestore;
}

class CodeCollisionError extends Error {}

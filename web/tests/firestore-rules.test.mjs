import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const projectId = "demo-fleet-dice-rules";
const matchId = "match-final-action";
const code = "4244";
const hostUid = "host-uid";
const guestUid = "guest-uid";

let testEnvironment;

before(async () => {
  const rules = await readFile(
    new URL("../firestore.rules", import.meta.url),
    "utf8",
  );
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });
});

beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "codes", code), {
        matchId,
        hostUid,
        guestUid,
        status: "active",
        updatedAt: new Date(0),
      }),
      setDoc(doc(db, "matches", matchId), {
        hostUid,
        guestUid,
        status: "active",
        state: {
          status: "active",
          winner: null,
          players: {
            host: { name: "Chris" },
            guest: { name: "Korbin" },
          },
        },
        version: 159,
        updatedAt: new Date(0),
      }),
      setDoc(doc(db, "liveBattles", matchId), {
        hostUid,
        guestUid,
        hostName: "Chris",
        guestName: "Korbin",
        status: "active",
        round: 11,
        updatedAt: new Date(0),
      }),
    ]);
  });
});

after(async () => {
  await testEnvironment.cleanup();
});

test("the guest can commit the final match action and finish its room code", async () => {
  const db = testEnvironment.authenticatedContext(guestUid).firestore();
  const matchRef = doc(db, "matches", matchId);
  const boardRef = doc(db, "liveBattles", matchId);
  const codeRef = doc(db, "codes", code);
  const resultRef = doc(db, "battleResults", matchId);

  await assertSucceeds(
    runTransaction(db, async (transaction) => {
      await Promise.all([
        transaction.get(matchRef),
        transaction.get(boardRef),
        transaction.get(codeRef),
      ]);
      transaction.update(matchRef, {
        status: "finished",
        state: {
          status: "finished",
          winner: "guest",
          players: {
            host: { name: "Chris" },
            guest: { name: "Korbin" },
          },
        },
        version: 160,
        updatedAt: serverTimestamp(),
      });
      transaction.delete(boardRef);
      transaction.set(resultRef, {
        winnerName: "Korbin",
        loserName: "Chris",
        finishedAt: serverTimestamp(),
      });
      transaction.update(codeRef, {
        status: "finished",
        updatedAt: serverTimestamp(),
      });
    }),
  );

  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const verificationDb = context.firestore();
    const [matchSnapshot, boardSnapshot, codeSnapshot, resultSnapshot] = await Promise.all([
      getDoc(doc(verificationDb, "matches", matchId)),
      getDoc(doc(verificationDb, "liveBattles", matchId)),
      getDoc(doc(verificationDb, "codes", code)),
      getDoc(doc(verificationDb, "battleResults", matchId)),
    ]);
    assert.equal(matchSnapshot.data().status, "finished");
    assert.equal(matchSnapshot.data().state.winner, "guest");
    assert.equal(boardSnapshot.exists(), false);
    assert.equal(codeSnapshot.data().status, "finished");
    assert.equal(resultSnapshot.data().winnerName, "Korbin");
    assert.equal(resultSnapshot.data().loserName, "Chris");
  });
});

test("a participant cannot publish winner names that disagree with the match", async () => {
  const db = testEnvironment.authenticatedContext(guestUid).firestore();
  const matchRef = doc(db, "matches", matchId);
  const resultRef = doc(db, "battleResults", matchId);

  await assertFails(
    runTransaction(db, async (transaction) => {
      await transaction.get(matchRef);
      transaction.update(matchRef, {
        status: "finished",
        state: {
          status: "finished",
          winner: "guest",
          players: {
            host: { name: "Chris" },
            guest: { name: "Korbin" },
          },
        },
        version: 160,
        updatedAt: serverTimestamp(),
      });
      transaction.set(resultRef, {
        winnerName: "Chris",
        loserName: "Korbin",
        finishedAt: serverTimestamp(),
      });
    }),
  );
});

test("recent name-only results are publicly readable", async () => {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "battleResults", matchId), {
      winnerName: "Korbin",
      loserName: "Chris",
      finishedAt: new Date(),
    });
  });

  const publicDb = testEnvironment.unauthenticatedContext().firestore();
  const snapshot = await assertSucceeds(
    getDoc(doc(publicDb, "battleResults", matchId)),
  );
  assert.equal(snapshot.data().winnerName, "Korbin");
});

test("a guest cannot alter room identity while finishing its code", async () => {
  const db = testEnvironment.authenticatedContext(guestUid).firestore();
  await assertFails(
    updateDoc(doc(db, "codes", code), {
      hostUid: guestUid,
      status: "finished",
      updatedAt: serverTimestamp(),
    }),
  );
});

test("a non-participant cannot finish an active room code", async () => {
  const db = testEnvironment.authenticatedContext("stranger-uid").firestore();
  await assertFails(
    updateDoc(doc(db, "codes", code), {
      status: "finished",
      updatedAt: serverTimestamp(),
    }),
  );
});

test("the host can cancel a waiting room and free its code", async () => {
  const waitingId = "match-waiting";
  const waitingCode = "1001";
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "codes", waitingCode), {
        matchId: waitingId,
        hostUid,
        guestUid: null,
        status: "waiting",
        updatedAt: new Date(0),
      }),
      setDoc(doc(db, "matches", waitingId), {
        hostUid,
        guestUid: null,
        status: "waiting",
        state: {
          status: "waiting",
          winner: null,
          cancelledBy: null,
          players: {
            host: { name: "Dave", email: hostUid, phase: "waiting" },
          },
        },
        version: 1,
        updatedAt: new Date(0),
      }),
      setDoc(doc(db, "liveBattles", waitingId), {
        hostUid,
        guestUid: null,
        hostName: "Dave",
        guestName: null,
        status: "waiting",
        round: 1,
        updatedAt: new Date(0),
      }),
    ]);
  });

  const db = testEnvironment.authenticatedContext(hostUid).firestore();
  const matchRef = doc(db, "matches", waitingId);
  const boardRef = doc(db, "liveBattles", waitingId);
  const codeRef = doc(db, "codes", waitingCode);

  await assertSucceeds(
    runTransaction(db, async (transaction) => {
      await Promise.all([
        transaction.get(matchRef),
        transaction.get(boardRef),
        transaction.get(codeRef),
      ]);
      transaction.update(matchRef, {
        status: "finished",
        state: {
          status: "finished",
          winner: null,
          cancelledBy: "Dave",
          players: {
            host: { name: "Dave", email: hostUid, phase: "over" },
          },
        },
        version: 2,
        updatedAt: serverTimestamp(),
      });
      transaction.delete(boardRef);
      transaction.delete(codeRef);
    }),
  );

  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const verificationDb = context.firestore();
    const [matchSnapshot, boardSnapshot, codeSnapshot] = await Promise.all([
      getDoc(doc(verificationDb, "matches", waitingId)),
      getDoc(doc(verificationDb, "liveBattles", waitingId)),
      getDoc(doc(verificationDb, "codes", waitingCode)),
    ]);
    assert.equal(matchSnapshot.data().status, "finished");
    assert.equal(boardSnapshot.exists(), false);
    assert.equal(codeSnapshot.exists(), false);
  });
});

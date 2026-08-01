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
        state: { status: "active" },
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

  await assertSucceeds(
    runTransaction(db, async (transaction) => {
      await Promise.all([
        transaction.get(matchRef),
        transaction.get(boardRef),
        transaction.get(codeRef),
      ]);
      transaction.update(matchRef, {
        status: "finished",
        state: { status: "finished", winner: "guest" },
        version: 160,
        updatedAt: serverTimestamp(),
      });
      transaction.delete(boardRef);
      transaction.update(codeRef, {
        status: "finished",
        updatedAt: serverTimestamp(),
      });
    }),
  );

  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    const verificationDb = context.firestore();
    const [matchSnapshot, boardSnapshot, codeSnapshot] = await Promise.all([
      getDoc(doc(verificationDb, "matches", matchId)),
      getDoc(doc(verificationDb, "liveBattles", matchId)),
      getDoc(doc(verificationDb, "codes", code)),
    ]);
    assert.equal(matchSnapshot.data().status, "finished");
    assert.equal(matchSnapshot.data().state.winner, "guest");
    assert.equal(boardSnapshot.exists(), false);
    assert.equal(codeSnapshot.data().status, "finished");
  });
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

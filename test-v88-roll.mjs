/**
 * Confirms each ship size rolls only inside its own face range.
 * d4 → 1–4, d6 → 1–6, d8 → 1–8, d10 → 1–10. Same formula as simple.html.
 */
import assert from "node:assert/strict";
import test from "node:test";

function roll(sides) {
  sides = sides | 0;
  if (sides < 1) return 0;
  return 1 + Math.floor(Math.random() * sides);
}

for (const sides of [4, 6, 8, 10]) {
  test(`d${sides} only lands on 1..${sides}`, () => {
    const seen = new Set();
    for (let i = 0; i < 8000; i += 1) {
      const n = roll(sides);
      assert.ok(n >= 1 && n <= sides, `got ${n} on d${sides}`);
      seen.add(n);
    }
    assert.equal(seen.size, sides, `d${sides} should eventually hit every face`);
  });
}

test("flagship face picker lands on 0..5 (shown as 1–6)", () => {
  const seen = new Set();
  for (let i = 0; i < 4000; i += 1) {
    const face = Math.floor(Math.random() * 6);
    assert.ok(face >= 0 && face <= 5);
    seen.add(face);
  }
  assert.equal(seen.size, 6);
});

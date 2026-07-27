"use client";

import {
  flagshipUpgradeCost,
  priceOf,
  slotPrice,
  type DieSize,
} from "@/lib/game";

export type ReferenceKind = "help" | "costs";

export function ReferenceSheets({
  kind,
  energy,
  baseEnergy,
  flagLevel,
  slots,
  shipCount,
  onClose,
}: {
  kind: ReferenceKind;
  energy: number;
  baseEnergy: number;
  flagLevel: number;
  slots: number;
  shipCount: number;
  onClose: () => void;
}) {
  return (
    <div className="reference-overlay" role="dialog" aria-modal="true" aria-labelledby="reference-title">
      <div className="reference-sheet">
        {kind === "help" ? <HelpSheet /> : (
          <CostsSheet
            baseEnergy={baseEnergy}
            energy={energy}
            flagLevel={flagLevel}
            shipCount={shipCount}
            slots={slots}
          />
        )}
        <button className="action-button blue-action full-action" onClick={onClose} type="button">
          Back to the game
        </button>
      </div>
    </div>
  );
}

function HelpSheet() {
  return (
    <>
      <p className="eyebrow">HOW TO PLAY</p>
      <h2 id="reference-title">Instructions</h2>
      <p className="stage-copy">
        Every die is a ship. Your <b className="energy-text">flagship</b> sits in the
        middle with 60 health. The match ends when one flagship is destroyed.
      </p>

      <article className="reference-card">
        <h3>A round, start to finish</h3>
        <ol className="reference-steps">
          <li>
            <b>Roll.</b> Roll 1 rolls every available ship and your flagship. Before
            rolls 2 and 3, tap only the dice you want to change. After three free
            rolls you can lock orders, buy an extra reroll, or use your Flagship Token.
          </li>
          <li>
            <b>Lock & wait.</b> When both fleets lock, rolls are revealed. Attack meets
            the other side’s shields; leftover volley and Direct go toward the flagship.
          </li>
          <li>
            <b>Take the hit.</b> Put ships in front of the volley if you want. Each
            blocks its size, then misses the next round. <b className="direct-text">Direct</b> always
            reaches the flagship.
          </li>
          <li>
            <b>Upgrade.</b> Between rounds, upgrade ships, open slots, buy ships, or
            raise the flagship — then roll again. You do not wait on the opponent after
            the reveal.
          </li>
        </ol>
      </article>

      <article className="reference-card">
        <h3>How to read a die</h3>
        <p>Even numbers attack. Odd numbers add shields. Printed marks also pay:</p>
        <ul className="reference-list">
          <li><b>1</b> — Energy</li>
          <li><b>2</b> — Direct (cannot be blocked)</li>
          <li><b>3</b> — Repair</li>
          <li><b>4</b> — Energy + attack</li>
          <li>Higher faces on upgraded ships add more repair or Direct</li>
        </ul>
      </article>

      <article className="reference-card">
        <h3>Flagship</h3>
        <p>
          It never attacks. Its number joins your straight, and its face boosts matching
          ship results (exact 2 / 3 / 4, every odd on 5, every even on 6). Face 1 raises
          standing Energy instead. Each fleet has one Flagship Token per match to rotate
          the face ±1 after roll 3.
        </p>
      </article>

      <article className="reference-card">
        <h3>Straights</h3>
        <p>
          Five or more consecutive numbers across the fleet (flagship counts). Length
          picks the prize type; the biggest ship in the line sets the size. You may cash
          a long straight as a shorter one.
        </p>
      </article>
    </>
  );
}

function CostsSheet({
  energy,
  baseEnergy,
  flagLevel,
  slots,
  shipCount,
}: {
  energy: number;
  baseEnergy: number;
  flagLevel: number;
  slots: number;
  shipCount: number;
}) {
  const flagMul = Math.min(4, flagLevel + 1);
  const openFree = Math.max(0, slots - shipCount);
  return (
    <>
      <p className="eyebrow">SHIPYARD</p>
      <h2 id="reference-title">Upgrade costs</h2>
      <p className="stage-copy">
        You have <b className="energy-text">{energy} Energy</b>
        {baseEnergy ? (
          <> and <b className="energy-text">+{baseEnergy}</b> comes in each round</>
        ) : null}
        .
      </p>

      <article className="reference-card">
        <h3>Buy ships</h3>
        <CostTable
          rows={([4, 6, 8, 10] as DieSize[]).map((sides) => ({
            what: `d${sides}`,
            price: `${priceOf(sides)}⚡`,
            why: `Averages ${((sides + 1) / 2).toFixed(1)} · blocks ${sides} when fed`,
          }))}
        />
        <p className="reference-note">{openFree} of {slots} slots free.</p>
      </article>

      <article className="reference-card">
        <h3>Upgrade ships in place</h3>
        <CostTable
          rows={[
            { what: "d4 → d6", price: `${priceOf(6) - priceOf(4)}⚡`, why: "Adds repair on 5 and Direct on 6" },
            { what: "d6 → d8", price: `${priceOf(8) - priceOf(6)}⚡`, why: "Adds repair on 7 and Direct on 8" },
            { what: "d8 → d10", price: `${priceOf(10) - priceOf(8)}⚡`, why: "Adds repair on 9 and Direct on 10" },
          ]}
        />
      </article>

      <article className="reference-card">
        <h3>Open fleet slots</h3>
        <CostTable
          rows={[5, 6, 7, 8].map((n) => ({
            what: `Slot ${n}${n <= slots ? " · open" : ""}`,
            price: `${slotPrice(n)}⚡`,
            why: n <= slots ? "Already in your formation" : "Then buy a ship to fill it",
          }))}
        />
      </article>

      <article className="reference-card">
        <h3>Flagship levels</h3>
        <CostTable
          rows={[
            {
              what: "Level 2 · matching dice +3",
              price: `${flagshipUpgradeCost(1)}⚡`,
              why: "Raises the bonus on all six faces",
            },
            {
              what: "Level 3 · matching dice +4",
              price: `${flagshipUpgradeCost(2)}⚡`,
              why: "Maximum flagship command",
            },
          ]}
        />
        <p className="reference-note">
          You are on level {flagLevel} — each matching die gets +{flagMul}.
        </p>
      </article>

      <article className="reference-card">
        <h3>Extra rerolls</h3>
        <CostTable
          rows={[
            {
              what: "Past your 3 free rolls",
              price: "1⚡ each die",
              why: "Mid-round only · gambles the attack already showing",
            },
          ]}
        />
      </article>

      <article className="reference-card">
        <h3>Where Energy comes from</h3>
        <CostTable
          rows={[
            { what: "Every 1 you roll", price: "+2⚡", why: "Best low roll" },
            { what: "Every 4 you roll", price: "+1⚡", why: "Still attacks for 4" },
            { what: "Standing income", price: `+${baseEnergy}⚡ / round`, why: "Raised by flagship face 1" },
            { what: "Short straight (5)", price: "Energy", why: "Longer straights pay attack or a ship" },
          ]}
        />
      </article>
    </>
  );
}

function CostTable({
  rows,
}: {
  rows: { what: string; price: string; why: string }[];
}) {
  return (
    <div className="cost-table">
      {rows.map((row) => (
        <div className="cost-row" key={row.what}>
          <div className="cost-what">{row.what}</div>
          <div className="cost-price">{row.price}</div>
          <div className="cost-why">{row.why}</div>
        </div>
      ))}
    </div>
  );
}

"use client";

import {
  directOf,
  energyOf,
  flagshipUpgradeCost,
  priceOf,
  repairOf,
  slotPrice,
  type DieSize,
} from "@/lib/game";
import {
  FlagHull,
  MarkIcon,
  ShipHull,
  flagFaceDetail,
} from "./DieArt";

export type ReferenceKind = "help" | "costs";

const SHAPES: { sides: DieSize; name: string; shape: string }[] = [
  { sides: 4, name: "d4", shape: "triangle" },
  { sides: 6, name: "d6", shape: "square" },
  { sides: 8, name: "d8", shape: "diamond" },
  { sides: 10, name: "d10", shape: "pentagon" },
];

const STRAIGHT_ROWS: { length: number; rewards: (string | null)[] }[] = [
  { length: 5, rewards: ["6⚡", "9⚡", "12⚡", "15⚡"] },
  { length: 6, rewards: ["8", "12", "16", "20"] },
  { length: 7, rewards: [null, "18", "24", "30"] },
  { length: 8, rewards: [null, null, "d8 +16", "d10 +20"] },
];

function faceEffectText(value: number) {
  const parts = [value % 2 === 0 ? `hits for ${value}` : `blocks for ${value}`];
  const energy = energyOf(value);
  const repair = repairOf(value);
  const direct = directOf(value);
  if (energy) parts.push(`earns ${energy} Energy`);
  if (repair) parts.push(`repairs ${repair}`);
  if (direct) parts.push(`fires ${direct} Direct`);
  return parts.join(" · ");
}

function FaceMarks({ value }: { value: number }) {
  const energy = energyOf(value);
  const repair = repairOf(value);
  const direct = directOf(value);
  if (!energy && !repair && !direct) {
    return <span className="help-face-empty">—</span>;
  }
  return (
    <span className="help-key-marks">
      {Array.from({ length: energy }, (_, index) => (
        <MarkIcon kind="bolt" key={`e-${index}`} />
      ))}
      {Array.from({ length: Math.min(repair, 4) }, (_, index) => (
        <MarkIcon kind="cross" key={`r-${index}`} />
      ))}
      {Array.from({ length: Math.min(direct, 4) }, (_, index) => (
        <MarkIcon kind="chev" key={`d-${index}`} />
      ))}
    </span>
  );
}

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
      <div className="reference-sheet reference-sheet-wide">
        {kind === "help" ? <HelpSheet flagLevel={flagLevel} /> : (
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

export function HelpSheet({
  flagLevel,
  standalone = false,
}: {
  flagLevel: number;
  standalone?: boolean;
}) {
  const mul = Math.min(4, flagLevel + 1);
  return (
    <>
      <p className="eyebrow">HOW TO PLAY</p>
      <h2 id="reference-title">How to play</h2>
      <p className="stage-copy">
        Every die is a ship. Your <b className="energy-text">flagship</b> sits in the
        middle with <b className="repair-text">60</b> health, and the match ends the
        moment one flagship is destroyed. There is no round limit — most matches run
        8 to 17.
      </p>

      <article className="reference-card">
        <h3>A round, start to finish</h3>
        <p className="reference-note" style={{ marginBottom: 10 }}>
          Four steps, always the same — versus just keeps each commander on their own
          pace after the reveal.
        </p>
        <ol className="reference-steps">
          <li>
            <b>1 · Roll.</b> The round opens with every available die <b>Ready</b>.
            Roll 1 rolls everything. Before rolls 2 and 3, tap only the ship dice or
            flagship you want to roll again. After the final free roll, either lock
            orders, buy another reroll, or use your Flagship Token.
          </li>
          <li>
            <b>2 · Lock.</b> When both fleets lock, rolls are revealed. Your attack
            meets Enemy shields; Enemy attack meets yours. Whatever is left over
            lands on a flagship.
          </li>
          <li>
            <b>3 · Take the hit.</b> You choose where Enemy damage goes — all on your
            flagship, or put as many ships as you want in front of it. Every ship you
            choose will miss the next round.
          </li>
          <li>
            <b>4 · Spend.</b> Between rounds you upgrade ships, open slots, buy new
            ships, or upgrade the flagship. Then it starts again. After the reveal you
            do not wait on your opponent to brace or shop.
          </li>
        </ol>
      </article>

      <article className="reference-card">
        <h3>Ship shapes</h3>
        <p>
          The hull is the size. Once you know the silhouette, you can read the board
          at a glance — same pictures you see when you roll:
        </p>
        <div className="help-shape-grid">
          {SHAPES.map((entry) => (
            <div className="help-shape-card" key={entry.sides}>
              <ShipHull ready sides={entry.sides} value={0} />
              <strong>{entry.name}</strong>
              <span>{entry.shape}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="reference-card">
        <h3>How to read a die</h3>
        <p>
          Every ship rolls one face. <b className="damage-text">Even numbers hit</b>,{" "}
          <b className="shield-text">odd numbers block</b>. Printed marks do a second
          job on top, and every mark always pays.
        </p>
        <div className="help-mark-grid">
          <div className="help-mark-card">
            <MarkIcon kind="bolt" />
            <div className="mark-copy">
              <strong>Lightning bolt · Energy</strong>
              <span>
                Yellow bolts are Energy you can spend later on rerolls, ships, slots,
                and flagship levels.
              </span>
            </div>
          </div>
          <div className="help-mark-card">
            <MarkIcon kind="cross" />
            <div className="mark-copy">
              <strong>Green plus · Repair</strong>
              <span>
                Green crosses heal your flagship this round. A 3 always repairs; bigger
                ships add more repair on 5 / 7 / 9.
              </span>
            </div>
          </div>
          <div className="help-mark-card">
            <MarkIcon kind="chev" />
            <div className="mark-copy">
              <strong>Violet chevron · Direct</strong>
              <span>
                Chevrons fire Direct damage that cannot be blocked — not by shields,
                not by a ship thrown in the way. It always reaches the enemy flagship.
              </span>
            </div>
          </div>
        </div>
      </article>

      <article className="reference-card">
        <h3>What each number does</h3>
        <p>
          A <b>4</b> is a <b>4</b> on every ship — same hit or block, same marks.
          Bigger ships just unlock higher numbers: d4 rolls 1–4, d6 rolls 1–6, d8
          rolls 1–8, and d10 rolls 1–10.
        </p>
        <div className="help-key-table" aria-label="What each number does">
          {Array.from({ length: 10 }, (_, index) => {
            const value = index + 1;
            return (
              <div className="help-key-row" key={value}>
                <b className={value % 2 === 0 ? "damage-text" : "shield-text"}>
                  {value}
                </b>
                <FaceMarks value={value} />
                <span>{faceEffectText(value)}</span>
              </div>
            );
          })}
        </div>
      </article>

      <article className="reference-card">
        <h3>Your flagship</h3>
        <p>
          It rolls like any other die, but it never fights. Its number joins your
          straight, and whichever face it lands on <b>adds a bonus to the matching
          ships</b> — 2, 3 and 4 match that exact number; 5 boosts every odd shield
          and 6 boosts every even attack. Those dice get a thin ring in the
          flagship&apos;s colour so you can see it happening. The <b>#1</b> face is
          the exception: it raises your standing Energy for the rest of the match, so
          it rings nothing.
        </p>
        <p className="reference-note">
          <b>Both fleets receive one Flagship Token per match.</b> After the final
          free roll, spend it to rotate the flagship one number up or down. The ends
          wrap: #1 can turn down to #6, and #6 can turn up to #1.
        </p>
        <p className="reference-note">
          {standalone
            ? "Your flagship starts at level 1, where each matching die gets +2. Upgrade it to raise that bonus."
            : `You are on level ${flagLevel} — each matching die currently gets +${mul}.`}
        </p>
        <div className="help-flag-grid help-flag-grid-wide">
          {[1, 2, 3, 4, 5, 6].map((face) => {
            const detail = flagFaceDetail(face, flagLevel);
            return (
              <div className="help-flag-card" key={face}>
                <FlagHull value={face} />
                <strong style={{ color: detail.fill }}>
                  #{face} · {detail.label}
                </strong>
                <span>{detail.short}</span>
              </div>
            );
          })}
        </div>
      </article>

      <article className="reference-card">
        <h3>Straights</h3>
        <p>
          Five or more numbers in a row across your whole fleet — and your
          flagship&apos;s number counts toward the line. <b>Length</b> decides what
          kind of prize you get; the <b>biggest ship</b> in the line decides how large
          it is. You may always cash a long straight as a shorter one if you would
          rather have the Energy than the hit.
        </p>
        <table className="straight-help-table">
          <thead>
            <tr>
              <th>Biggest ship</th>
              <th>d4</th>
              <th>d6</th>
              <th>d8</th>
              <th>d10</th>
            </tr>
          </thead>
          <tbody>
            {STRAIGHT_ROWS.map((row) => (
              <tr key={row.length}>
                <td>{row.length} in a row</td>
                {row.rewards.map((cell, index) => (
                  <td className={cell ? undefined : "na"} key={`${row.length}-${index}`}>
                    {cell ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="reference-note">
          Length 6+ pays Attack (shown as a number). Length 8 also awards a free ship
          of that size.
        </p>
      </article>

      <article className="reference-card">
        <h3>Taking damage</h3>
        <p>
          When the Enemy volley gets through you may put <b>as many available ships as
          you want</b> in front of it. Each blocks damage equal to its own size — a
          d10 blocks 10 — and is then <b>damaged</b> for the next round. Every ship
          you use is one less die you will roll next round. It returns the round after
          that.
        </p>
        <p className="reference-note">
          <b className="direct-text">Direct</b> is the exception. A <b>2</b> fires 2
          Direct, and upgrading ships add more chevrons on 6 / 8 / 10. Nothing stops
          Direct — not shields, not a ship thrown in the way. It always reaches the
          flagship.
        </p>
      </article>

      <article className="reference-card">
        <h3>Winning</h3>
        <p>
          Destroy the Enemy flagship. If both fall in the same round, the heavier
          final volley wins; if those are level, damage across the whole match breaks
          the tie.
        </p>
        <p className="reference-note">
          <b>War escalation is the long-game timer.</b> It begins after round 8: both
          fleets add <b className="damage-text">+4 attack in round 9</b>,{" "}
          <b className="damage-text">+8 in round 10</b>, and another +4 each round
          after that. It does not change your dice or Direct; it only makes ordinary
          volleys hit harder so a defensive match cannot stall forever.
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

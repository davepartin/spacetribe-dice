"use client";

import type { DieSize } from "@/lib/game";
import { directOf, energyOf, repairOf } from "@/lib/game";

const HULLS: Record<
  number,
  { pts: string; textY: number; scale: number; boltY: number; boltR: number }
> = {
  4: { pts: "50,10 93,84 7,84", textY: 63, scale: 0.95, boltY: 73, boltR: 1.1 },
  6: { pts: "15,15 85,15 85,85 15,85", textY: 48, scale: 0.92, boltY: 68, boltR: 1.7 },
  8: { pts: "50,6 92,50 50,94 8,50", textY: 50, scale: 0.95, boltY: 62, boltR: 1.42 },
  10: { pts: "50,5 94,38 77,92 23,92 6,38", textY: 52, scale: 1, boltY: 72, boltR: 1.8 },
};

const BOLT = "M0,-6 L-3.4,1 L-0.6,1 L-2.4,6 L3.4,-1.4 L0.6,-1.4 Z";
const CROSS = "M-2,-6 L2,-6 L2,-2 L6,-2 L6,2 L2,2 L2,6 L-2,6 L-2,2 L-6,2 L-6,-2 L-2,-2 Z";
const CHEV = "M-4,-6 L1.2,0 L-4,6 L-1.2,6 L4,0 L-1.2,-6 Z";

const FLAG_FACE: Record<
  number,
  { fill: string; ink: string; label: string; short: (mul: number) => string }
> = {
  1: {
    fill: "var(--energy)",
    ink: "#211a02",
    label: "Reactor",
    short: (mul) => `Base Energy +${mul}`,
  },
  2: {
    fill: "var(--direct)",
    ink: "#1e1233",
    label: "Direct",
    short: (mul) => `+${mul} Direct per #2`,
  },
  3: {
    fill: "var(--repair)",
    ink: "#06291b",
    label: "Repair",
    short: (mul) => `+${mul} repair per #3`,
  },
  4: {
    fill: "var(--energy)",
    ink: "#211a02",
    label: "Energy",
    short: (mul) => `+${mul} Energy per #4`,
  },
  5: {
    fill: "var(--blue)",
    ink: "#062a47",
    label: "Shields",
    short: (mul) => `+${mul} per shield`,
  },
  6: {
    fill: "var(--red)",
    ink: "#3d0812",
    label: "Attack",
    short: (mul) => `+${mul} per attack`,
  },
};

function marks(
  count: number,
  glyph: string,
  colour: string,
  y: number,
  r: number,
  gap: number,
  cls: string,
) {
  if (!count) return null;
  const start = -(gap * (count - 1)) / 2;
  return Array.from({ length: count }, (_, index) => (
    <path
      className={cls}
      d={glyph}
      fill={colour}
      key={`${cls}-${index}`}
      transform={`translate(${50 + start + index * gap},${y}) scale(${r})`}
    />
  ));
}

export function ShipHull({
  sides,
  value,
  ready = false,
}: {
  sides: DieSize | number;
  value: number;
  ready?: boolean;
}) {
  const hull = HULLS[sides] || HULLS[6];
  const kind = ready ? "ready" : value % 2 === 0 ? "attack" : "defense";
  const col =
    kind === "attack" ? "var(--red)" : kind === "defense" ? "var(--blue)" : "var(--faint)";
  const shown = ready ? "◆" : String(value);
  return (
    <svg className="hull" viewBox="0 0 100 100" aria-hidden="true">
      <polygon
        points={hull.pts}
        fill={col}
        fillOpacity={kind === "ready" ? 0.08 : 0.13}
        stroke={col}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <text
        x="50"
        y={hull.textY}
        textAnchor="middle"
        fill={col}
        fontSize={40 * hull.scale * (ready ? 0.7 : 1)}
        fontWeight={800}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {shown}
      </text>
      {!ready
        ? marks(energyOf(value), BOLT, "var(--energy)", hull.boltY, hull.boltR, 9 * hull.boltR, "mk")
        : null}
      {!ready
        ? marks(
            Math.min(repairOf(value), 4),
            CROSS,
            "var(--repair)",
            hull.boltY,
            hull.boltR * 0.52,
            10 * hull.boltR,
            "cr",
          )
        : null}
      {!ready
        ? marks(
            Math.min(directOf(value), 4),
            CHEV,
            "var(--direct)",
            hull.boltY,
            hull.boltR * 0.9,
            9 * hull.boltR,
            "ch",
          )
        : null}
    </svg>
  );
}

export function FlagHull({ value, ready = false }: { value: number; ready?: boolean }) {
  const face = FLAG_FACE[value] || { fill: "#f2f5ff", ink: "#101828", label: "Flagship", short: () => "Flagship" };
  return (
    <svg className="hull" viewBox="0 0 100 100" aria-hidden="true">
      <rect
        x="11"
        y="11"
        width="78"
        height="78"
        rx="17"
        fill={face.fill}
        stroke="#f2f5ff"
        strokeWidth="2.6"
      />
      <rect
        x="19"
        y="19"
        width="62"
        height="62"
        rx="11"
        fill="none"
        stroke={face.ink}
        strokeOpacity={0.22}
        strokeWidth="1"
      />
      <text
        x="50"
        y="63"
        textAnchor="middle"
        fill={face.ink}
        fontSize={ready ? 28 : 36.8}
        fontWeight={800}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {ready ? "◆" : value}
      </text>
    </svg>
  );
}

export function flagFaceLabel(value: number): string {
  return FLAG_FACE[value]?.label || "Flagship";
}

export function flagFaceDetail(value: number, flagLevel = 1) {
  const face = FLAG_FACE[value] || {
    fill: "#f2f5ff",
    ink: "#101828",
    label: "Flagship",
    short: () => "Flagship",
  };
  const mul = Math.min(4, flagLevel + 1);
  return {
    fill: face.fill,
    ink: face.ink,
    label: face.label,
    short: face.short(mul),
  };
}

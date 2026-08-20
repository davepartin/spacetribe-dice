"use client";

import { useId } from "react";
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

const PLASTIC: Record<
  "attack" | "defense" | "ready",
  { light: string; mid: string; dark: string; left: string; right: string; ink: string }
> = {
  attack: { light: "#ff8b96", mid: "#ff4d5e", dark: "#8f1826", left: "#c43344", right: "#6d101c", ink: "#fff7f8" },
  defense: { light: "#8ad4ff", mid: "#3aabef", dark: "#155a8c", left: "#2b86c4", right: "#0e3f66", ink: "#f4fbff" },
  ready: { light: "#d8e1ee", mid: "#8fa0b6", dark: "#3a4658", left: "#6b7a90", right: "#2a3444", ink: "#f4f7fb" },
};

function parsePts(pts: string) {
  return pts.trim().split(/\s+/).map((pair) => {
    const [x, y] = pair.split(",");
    return { x: Number(x), y: Number(y) };
  });
}

export function ShipHull({
  sides,
  value,
  ready = false,
  v2 = false,
}: {
  sides: DieSize | number;
  value: number;
  ready?: boolean;
  v2?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const hull = HULLS[sides] || HULLS[6];
  const kind = ready ? "ready" : value % 2 === 0 ? "attack" : "defense";
  if (v2) {
    const pal = PLASTIC[kind];
    const top = parsePts(hull.pts);
    const lift = 6;
    const shown = ready || !value ? "" : String(value);
    return (
      <svg className="hull" viewBox="-4 -4 108 118" aria-hidden="true">
        <defs>
          <linearGradient id={`dg${uid}`} x1="18%" y1="6%" x2="86%" y2="94%">
            <stop offset="0%" stopColor={pal.light} />
            <stop offset="48%" stopColor={pal.mid} />
            <stop offset="100%" stopColor={pal.dark} />
          </linearGradient>
          <clipPath id={`cl${uid}`}>
            <polygon points={hull.pts} />
          </clipPath>
        </defs>
        <ellipse cx="50" cy="104" rx="28" ry="7" fill="#000" opacity={0.4} />
        {top.map((a, index) => {
          const b = top[(index + 1) % top.length]!;
          const mx = (a.x + b.x) / 2;
          return (
            <polygon
              fill={mx < 50 ? pal.left : pal.right}
              key={`side-${index}`}
              points={`${a.x},${a.y} ${b.x},${b.y} ${b.x},${b.y + lift} ${a.x},${a.y + lift}`}
            />
          );
        })}
        <polygon
          fill={`url(#dg${uid})`}
          points={hull.pts}
          stroke={pal.light}
          strokeLinejoin="round"
          strokeWidth={2.2}
        />
        <g clipPath={`url(#cl${uid})`}>
          <ellipse cx="38" cy="32" rx="18" ry="10" fill="#fff" opacity={0.28} />
        </g>
        <g className="face-ink">
          {shown ? (
            <text
              fill={pal.ink}
              fontSize={40 * hull.scale}
              fontWeight={800}
              paintOrder="stroke"
              stroke="#1a1020"
              strokeWidth={0.7}
              style={{ fontVariantNumeric: "tabular-nums" }}
              textAnchor="middle"
              x="50"
              y={hull.textY}
            >
              {shown}
            </text>
          ) : null}
          {!ready && value
            ? marks(energyOf(value), BOLT, "var(--energy)", hull.boltY, hull.boltR, 9 * hull.boltR, "mk")
            : null}
          {!ready && value
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
          {!ready && value
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
        </g>
      </svg>
    );
  }
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

export function FlagHull({
  value,
  ready = false,
  v2 = false,
}: {
  value: number;
  ready?: boolean;
  v2?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const face = FLAG_FACE[value] || { fill: "#f2f5ff", ink: "#101828", label: "Flagship", short: () => "Flagship" };
  if (v2) {
    const show = ready || !value ? "" : String(value);
    return (
      <svg className="hull" viewBox="-6 -6 112 118" aria-hidden="true">
        <defs>
          <linearGradient id={`fg${uid}`} x1="18%" y1="8%" x2="88%" y2="92%">
            <stop offset="0%" stopColor="#fff6d0" />
            <stop offset="42%" stopColor={face.fill} />
            <stop offset="100%" stopColor="#7a5a10" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="102" rx="30" ry="7" fill="#000" opacity={0.42} />
        <rect x="18" y="20" width="70" height="70" rx="16" fill="#6b4e0c" />
        <rect
          x="11"
          y="11"
          width="78"
          height="78"
          rx="17"
          fill={`url(#fg${uid})`}
          stroke="#f7e7a0"
          strokeWidth="3"
        />
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="11"
          fill="none"
          stroke={face.ink}
          strokeOpacity={0.22}
          strokeWidth="1"
        />
        <ellipse cx="36" cy="30" rx="22" ry="12" fill="#fff" opacity={0.22} />
        {show ? (
          <g className="face-ink">
            <text
              fill={face.ink}
              fontSize={36.8}
              fontWeight={800}
              style={{ fontVariantNumeric: "tabular-nums" }}
              textAnchor="middle"
              x="50"
              y="63"
            >
              {show}
            </text>
          </g>
        ) : null}
      </svg>
    );
  }
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

export function HullOutline({ sides }: { sides: DieSize | number }) {
  const hull = HULLS[sides] || HULLS[6];
  return (
    <svg className="hull" viewBox="0 0 100 100" aria-hidden="true">
      <polygon
        points={hull.pts}
        fill="var(--dim)"
        fillOpacity={0.14}
        stroke="var(--ink)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarkIcon({
  kind,
  className = "mark-icon",
}: {
  kind: "bolt" | "cross" | "chev";
  className?: string;
}) {
  const glyph = kind === "bolt" ? BOLT : kind === "cross" ? CROSS : CHEV;
  const colour =
    kind === "bolt" ? "var(--energy)" : kind === "cross" ? "var(--repair)" : "var(--direct)";
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d={glyph} fill={colour} transform="translate(10,10) scale(1.15)" />
    </svg>
  );
}

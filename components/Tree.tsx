// /**
//  * Grows a leaf per verified record. Shared between the landing page
//  * (demo data) and the in-app project dashboard (live verifiedCount),
//  * so it takes the count as a prop rather than fetching itself.
//  */
// export function Tree({ verifiedCount }: { verifiedCount: number }) {
//   const leafCount = Math.min(verifiedCount, 24); // cap for visual sanity
//   const leaves = Array.from({ length: leafCount });

//   return (
//     <svg viewBox="0 0 200 220" className="w-full h-full" aria-hidden="true">
//       {/* trunk */}
//       <path
//         d="M100 220 L100 130"
//         stroke="#3E4A40"
//         strokeWidth="6"
//         strokeLinecap="round"
//       />
//       {/* branches */}
//       <path
//         d="M100 160 L70 130 M100 150 L130 120 M100 135 L100 100"
//         stroke="#3E4A40"
//         strokeWidth="4"
//         strokeLinecap="round"
//         fill="none"
//       />
//       {/* leaves — one per verified record, gently offset in a loose canopy */}
//       {leaves.map((_, i) => {
//         const angle = (i / Math.max(leafCount, 1)) * Math.PI * 2;
//         const radius = 30 + (i % 3) * 12;
//         const cx = 100 + Math.cos(angle) * radius;
//         const cy = 90 + Math.sin(angle) * radius * 0.7;
//         return (
//           <circle
//             key={i}
//             cx={cx}
//             cy={cy}
//             r={6}
//             fill="#5FA777"
//             opacity={0.85}
//             style={{
//               animation: `leaf-grow 0.4s ease-out ${i * 0.05}s backwards`,
//             }}
//           />
//         );
//       })}
//       <style>{`
//         @keyframes leaf-grow {
//           from { transform: scale(0); opacity: 0; }
//           to { transform: scale(1); opacity: 0.85; }
//         }
//       `}</style>
//     </svg>
//   );
// }







"use client";

/**
 * Grows a leaf cluster per verified record, on real branch tips rather
 * than a circular scatter. Shared between the landing page (demo data)
 * and the in-app project dashboard (live verifiedCount), so it takes
 * the count as a prop rather than fetching itself.
 *
 * Leaf greens (#8ECBA3 / #5FA777 / #3F7A5C) are the same signal-green
 * family as BugHero's `verified` color (#5FA777) — the two animations
 * read as one visual system.
 */

const GREEN_LIGHT = "#8ECBA3";
const GREEN_MID = "#5FA777";
const GREEN_DARK = "#3F7A5C";

type Point = { x: number; y: number };

function bezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

function seededRand(seed: number) {
  const x = Math.sin(seed * 999.7) * 10000;
  return x - Math.floor(x);
}

const trunkBase: Point = { x: 120, y: 220 };
const trunkTop: Point = { x: 120, y: 140 };

const branchDefs: { p0: Point; p1: Point; p2: Point; p3: Point; width: number }[] = [
  { p0: trunkTop, p1: { x: 100, y: 120 }, p2: { x: 60, y: 110 }, p3: { x: 38, y: 78 }, width: 7 },
  { p0: trunkTop, p1: { x: 135, y: 118 }, p2: { x: 170, y: 112 }, p3: { x: 196, y: 80 }, width: 7 },
  { p0: trunkTop, p1: { x: 112, y: 100 }, p2: { x: 108, y: 70 }, p3: { x: 98, y: 38 }, width: 6.5 },
  { p0: trunkTop, p1: { x: 128, y: 98 }, p2: { x: 138, y: 66 }, p3: { x: 152, y: 36 }, width: 6.5 },
  { p0: { x: 60, y: 110 }, p1: { x: 45, y: 100 }, p2: { x: 25, y: 96 }, p3: { x: 14, y: 110 }, width: 4 },
  { p0: { x: 170, y: 112 }, p1: { x: 186, y: 102 }, p2: { x: 206, y: 100 }, p3: { x: 216, y: 114 }, width: 4 },
  { p0: { x: 108, y: 70 }, p1: { x: 96, y: 56 }, p2: { x: 80, y: 46 }, p3: { x: 66, y: 50 }, width: 4 },
  { p0: { x: 138, y: 66 }, p1: { x: 150, y: 52 }, p2: { x: 166, y: 44 }, p3: { x: 180, y: 50 }, width: 4 },
];

function pathD(p0: Point, p1: Point, p2: Point, p3: Point) {
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
}

// Precompute leaf-cluster anchor points along each branch's outer half —
// same tip points every render, since branchDefs is a module-level constant.
const tipPoints: (Point & { seed: number })[] = [];
branchDefs.forEach((b, bi) => {
  const count = bi < 4 ? 3 : 2;
  for (let i = 0; i < count; i++) {
    const t = 0.55 + (i / count) * 0.45;
    const pt = bezier(b.p0, b.p1, b.p2, b.p3, t);
    const seed = bi * 10 + i;
    tipPoints.push({
      x: pt.x + (seededRand(seed) - 0.5) * 14,
      y: pt.y + (seededRand(seed + 5) - 0.5) * 12,
      seed,
    });
  }
});

function leafColor(seed: number) {
  const r = seededRand(seed + 50);
  if (r < 0.33) return GREEN_LIGHT;
  if (r < 0.66) return GREEN_MID;
  return GREEN_DARK;
}

function LeafCluster({ point, index }: { point: Point & { seed: number }; index: number }) {
  const petals = 3;
  return (
    <g
      style={{
        transformOrigin: `${point.x}px ${point.y}px`,
        animation: `dropback-leaf-grow 0.45s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.04}s backwards`,
      }}
    >
      {Array.from({ length: petals }).map((_, i) => {
        const angle = (i / petals) * Math.PI * 2 + seededRand(point.seed + i) * 1.5;
        const r = 5.5;
        const ex = point.x + Math.cos(angle) * r * 0.9;
        const ey = point.y + Math.sin(angle) * r * 0.9;
        return (
          <ellipse
            key={i}
            cx={ex}
            cy={ey}
            rx={5.5}
            ry={3.2}
            transform={`rotate(${(angle * 180) / Math.PI} ${ex} ${ey})`}
            fill={leafColor(point.seed + i)}
            opacity={0.92}
          />
        );
      })}
    </g>
  );
}

export function Tree({ verifiedCount }: { verifiedCount: number }) {
  const leafCount = Math.min(verifiedCount, tipPoints.length);
  const activeTips = tipPoints.slice(0, leafCount);

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full" aria-hidden="true">
      <ellipse cx="120" cy="222" rx="70" ry="8" fill="#000" opacity="0.06" />

      <g fill="none" stroke="#5B4A3A" strokeLinecap="round">
        <path d={pathD(trunkBase, { x: 118, y: 195 }, { x: 122, y: 165 }, trunkTop)} strokeWidth={11} />
        {branchDefs.map((b, i) => (
          <path key={i} d={pathD(b.p0, b.p1, b.p2, b.p3)} strokeWidth={b.width} />
        ))}
      </g>

      <g>
        {activeTips.map((pt, i) => (
          <LeafCluster key={i} point={pt} index={i} />
        ))}
      </g>

      <style>{`
        @keyframes dropback-leaf-grow {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
import Link from "next/link";
import { Tree } from "@/components/Tree";
import { BugHero } from "@/components/BugHero";

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="min-h-[90vh] pt-5 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <p className="font-mono text-xs uppercase tracking-widest text-amber mb-4">
          for testers and the devs who fix things
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-bold max-w-3xl leading-[1.05]">
          Bug reports your dev team actually acts on.
        </h1>
        <p className="text-muted max-w-xl mt-6 text-lg">
          Upload a screenshot, write a note, drop it on the developer's desk.
          Every retest is logged — nobody asks "wait, did you fix that?" again.
        </p>
        <div className="flex gap-4 mt-10">
          <Link
            href="/login"
            className="bg-amber text-ink font-medium px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            Get started
          </Link>
          <a
            href="#how-it-works"
            className="border border-hairline px-6 py-3 rounded-lg hover:border-amber/50 transition"
          >
            See how it works
          </a>
        </div>


        <div className="mt-16 w-64 h-64">
          <BugHero status="in_progress" />
        </div>
      </section>

      {/* The loop */}
      <section id="how-it-works" className="px-6 py-24 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold mb-12 text-center">
          The loop
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Tester reports",
              body: "Screenshot + note. Auto-tagged with the page URL and timestamp.",
            },
            {
              title: "Dev fixes",
              body: "Reviews the record, ships the fix, flags it for retest.",
            },
            {
              title: "Tester verifies",
              body: "Retests against the same record. Closes it or reopens it.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-surface border border-hairline rounded-xl p-6"
            >
              <h3 className="font-display font-bold text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-muted text-sm">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tree — reflects real demo project data */}
      <section className="px-6 py-24 max-w-2xl mx-auto text-center">
        <h2 className="font-display text-3xl font-bold mb-4">
          Every verified bug is a leaf.
        </h2>
        <p className="text-muted mb-10">
          This tree tracks a real demo project's verified-bug count — not a loop, actual data.
        </p>
        <div className="w-64 h-64 mx-auto">
          <Tree verifiedCount={30} />
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <Link
          href="/login"
          className="bg-amber text-ink font-medium px-8 py-4 rounded-lg hover:opacity-90 transition inline-block"
        >
          Start tracking bugs
        </Link>
      </section>
    </main>
  );
}








// import Link from "next/link";
// import { Tree } from "@/components/Tree";

// export default function LandingPage() {
//   return (
//     <main>
//       {/* Hero */}
//       <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
//         <p className="font-mono text-xs uppercase tracking-widest text-amber mb-4">
//           for testers and the devs who fix things
//         </p>
//         <h1 className="font-display text-5xl md:text-7xl font-bold max-w-3xl leading-[1.05]">
//           Bug reports your dev team actually acts on.
//         </h1>
//         <p className="text-muted max-w-xl mt-6 text-lg">
//           Upload a screenshot, write a note, drop it on the developer's desk.
//           Every retest is logged — nobody asks "wait, did you fix that?" again.
//         </p>
//         <div className="flex gap-4 mt-10">
//           <Link
//             href="/login"
//             className="bg-amber text-ink font-medium px-6 py-3 rounded-lg hover:opacity-90 transition"
//           >
//             Get started
//           </Link>
//           <a
//             href="#how-it-works"
//             className="border border-hairline px-6 py-3 rounded-lg hover:border-amber/50 transition"
//           >
//             See how it works
//           </a>
//         </div>

//         {/* 3D bug placeholder — swap for the three.js scene described in the
//             project doc: bug shifts red -> amber -> green as it "settles" */}
//         <div
//           id="bug-hero"
//           className="mt-16 w-40 h-40 opacity-90"
//           aria-hidden="true"
//         >
//           <BugPlaceholder />
//         </div>
//       </section>

//       {/* The loop */}
//       <section id="how-it-works" className="px-6 py-24 max-w-4xl mx-auto">
//         <h2 className="font-display text-3xl font-bold mb-12 text-center">
//           The loop
//         </h2>
//         <div className="grid md:grid-cols-3 gap-8">
//           {[
//             {
//               title: "Tester reports",
//               body: "Screenshot + note. Auto-tagged with the page URL and timestamp.",
//             },
//             {
//               title: "Dev fixes",
//               body: "Reviews the record, ships the fix, flags it for retest.",
//             },
//             {
//               title: "Tester verifies",
//               body: "Retests against the same record. Closes it or reopens it.",
//             },
//           ].map((step) => (
//             <div
//               key={step.title}
//               className="bg-surface border border-hairline rounded-xl p-6"
//             >
//               <h3 className="font-display font-bold text-lg mb-2">
//                 {step.title}
//               </h3>
//               <p className="text-muted text-sm">{step.body}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Tree — reflects real demo project data */}
//       <section className="px-6 py-24 max-w-2xl mx-auto text-center">
//         <h2 className="font-display text-3xl font-bold mb-4">
//           Every verified bug is a leaf.
//         </h2>
//         <p className="text-muted mb-10">
//           This tree tracks a real demo project's verified-bug count — not a loop, actual data.
//         </p>
//         <div className="w-64 h-64 mx-auto">
//           <Tree verifiedCount={12} />
//         </div>
//       </section>

//       <section className="px-6 py-24 text-center">
//         <Link
//           href="/login"
//           className="bg-amber text-ink font-medium px-8 py-4 rounded-lg hover:opacity-90 transition inline-block"
//         >
//           Start tracking bugs
//         </Link>
//       </section>
//     </main>
//   );
// }

// function BugPlaceholder() {
//   // Static SVG stand-in for the three.js hero bug — same red/amber/green
//   // logic, just not yet wired to WebGL.
//   return (
//     <svg viewBox="0 0 100 100" className="w-full h-full">
//       <ellipse cx="50" cy="55" rx="22" ry="30" fill="#E2A33D" opacity="0.9" />
//       <circle cx="50" cy="25" r="12" fill="#E2A33D" opacity="0.9" />
//       {[...Array(6)].map((_, i) => {
//         const side = i < 3 ? -1 : 1;
//         const y = 40 + (i % 3) * 15;
//         return (
//           <line
//             key={i}
//             x1={50 + side * 20}
//             y1={y}
//             x2={50 + side * 35}
//             y2={y + 8}
//             stroke="#E2A33D"
//             strokeWidth="3"
//             strokeLinecap="round"
//           />
//         );
//       })}
//     </svg>
//   );
// }

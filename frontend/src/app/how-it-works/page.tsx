import Link from "next/link";

import { MilestoneTimeline } from "@/components/milestone-timeline";
import { PageHero } from "@/components/page-hero";
import { ScrollLinkedStepper } from "@/components/scroll-linked-stepper";

const overview = [
  {
    title: "Set expectations up front",
    description: "Scope, milestone language, and documentation requirements are confirmed before funds move.",
  },
  {
    title: "Track proof of progress",
    description: "Contractors submit evidence in-app, and homeowners approve or request updates with context.",
  },
  {
    title: "Release or resolve quickly",
    description: "Funds are wired within hours of approval, or paused while Conforma facilitates a solution.",
  },
];

const highlights = [
  {
    title: "Project kickoff call",
    description:
      "A Conforma specialist reviews the contract with both parties, aligns on milestones, and confirms inspection requirements.",
  },
  {
    title: "Evidence checklist",
    description:
      "Each milestone has clear photo, document, or permit expectations so everyone knows what approval requires.",
  },
  {
    title: "Escrow ledger",
    description:
      "Releases and change orders are timestamped in a shared ledger that can be exported for insurance or lender records.",
  },
  {
    title: "Dispute path",
    description:
      "If there is a disagreement, Conforma coordinates documentation review and, when needed, brings in licensed mediators.",
  },
];

export default function HowItWorks() {
  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow="The Conforma playbook"
        title="From scope to final payout, see escrow in action"
        description="Our licensed team guides every step so Texas homeowners and contractors stay aligned, funded, and on schedule."
        align="left"
        actions={[
          { href: "/register", label: "Launch your project" },
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {overview.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/60 bg-white/80 p-5 text-left shadow-sm shadow-slate-900/5"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="surface-card rounded-3xl border border-white/60 bg-white/90 p-10 shadow-lg shadow-slate-900/10 backdrop-blur">
            <h2 className="text-3xl font-semibold text-slate-900">Milestones at work</h2>
            <p className="mt-3 text-base text-slate-600">
              This interactive view walks through each stage of the Conforma escrow process, from initial deposit to the final punch list.
            </p>
            <div className="mt-12">
              <ScrollLinkedStepper />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">A transparent timeline</h2>
            <p className="mt-3 text-base text-slate-600">
              Every Conforma project follows a regulated cadence. Hover over each milestone to see what evidence is required before funds move.
            </p>
          </div>
          <div className="mt-12">
            <MilestoneTimeline />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">What to expect from the Conforma team</h2>
            <p className="mt-3 text-base text-slate-600">
              We stay close to every project with friendly check-ins, compliance expertise, and fast answers when you need them.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-left shadow-sm shadow-slate-900/5"
              >
                <h3 className="text-lg font-semibold text-slate-900">{highlight.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16">
        <div className="container px-4 md:px-6">
          <div className="surface-card rounded-3xl border border-white/60 bg-white/90 p-8 text-sm text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur">
            <p>
              Ready to see Conforma in action? Register to set up your escrow workspace—our team will follow up once your milestones are in place.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { StatsCounter } from "@/components/stats-counter";

const stats = [
  { label: "Average payout release", value: 48, suffix: " hrs" },
  { label: "Scheduled disputes resolved", value: 94, suffix: "%" },
  { label: "Projects funded end-to-end", value: 3200, suffix: "+" },
];

const advantages = [
  {
    title: "Cash flow you can trust",
    description:
      "Funds are deposited before mobilising crews. You see the balance and release schedule the moment you log in.",
  },
  {
    title: "Paperwork off your plate",
    description:
      "Upload completion evidence once. Conforma packages it for the homeowner, tracks approvals, and files it in your project record.",
  },
  {
    title: "Dispute prevention and support",
    description:
      "Our coordinators facilitate quick conversations, so a question about quality does not derail the rest of the schedule.",
  },
];

const successStories = [
  {
    title: "Solar installer in San Antonio",
    body: "Shifted to Conforma for 18 residential arrays. Progress photos and utility interconnection receipts keep approvals under 12 hours.",
  },
  {
    title: "High-end remodeler in Austin",
    body: "Uses Conforma to manage allowances and change orders. Clients see a transparent ledger which reduces friction at closeout.",
  },
];

const playbook = [
  {
    title: "Kickoff with confidence",
    description:
      "Conforma verifies licenses, insurance, and contract scope so every party starts with the same documentation.",
  },
  {
    title: "Submit progress evidence",
    description:
      "Upload site photos, inspection reports, or supplier invoices. Our team reviews for completeness before routing to the homeowner.",
  },
  {
    title: "Get paid faster",
    description:
      "Most approvals finalize within 48 hours. Funds are released electronically with a receipt saved to your account.",
  },
];

export default function Contractors() {
  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow="For contractors"
        title="Predictable payouts on every Texas project"
        description="Conforma locks in homeowner funding, manages milestone paperwork, and keeps crews focused on the build."
        align="left"
        actions={[
          { href: "/register", label: "Set up your project" },
          { href: "/contact", label: "Talk with our onboarding team", variant: "secondary" },
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/60 bg-white/80 p-5 text-left shadow-sm shadow-slate-900/5 backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                <StatsCounter value={stat.value} suffix={stat.suffix} />
              </p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">What Conforma handles for you</h2>
            <p className="mt-3 text-base text-slate-600">
              Skip payment chasing and focus on quality work. Our licensed escrow team keeps milestones on schedule.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {advantages.map((advantage) => (
              <div
                key={advantage.title}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-left shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
              >
                <h3 className="text-lg font-semibold text-slate-900">{advantage.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Trusted by Texas professionals</h2>
            <p className="mt-3 text-base text-slate-600">
              Pros across solar, remodeling, and specialty trades lean on Conforma to prove credibility to homeowners.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {successStories.map((story) => (
              <div
                key={story.title}
                className="surface-card h-full rounded-3xl border border-white/60 bg-white/90 p-6 text-left shadow-lg shadow-slate-900/10 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-slate-900">{story.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{story.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Your playbook to smoother projects</h2>
            <p className="mt-3 text-base text-slate-600">
              Integrate escrow into your sales process and show prospects that every draw is structured and fair.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {playbook.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-left shadow-sm shadow-slate-900/5"
              >
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16">
        <div className="container px-4 md:px-6">
          <div className="surface-card flex flex-col items-start gap-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-lg shadow-slate-900/10 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Ready to close your next project faster?</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                Invite your homeowner to Conforma and we will set up milestones, documentation, and releases for you.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                Onboard now
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60"
              >
                Book a walkthrough
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

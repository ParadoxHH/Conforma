import Link from "next/link";

import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";
import { StatsCounter } from "@/components/stats-counter";

const stats = [
  { label: "Funds protected", value: 92000000, prefix: "$", suffix: "+" },
  { label: "Average release time", value: 48, suffix: " hrs" },
  { label: "Projects guided", value: 5200, suffix: "+" },
];

const assurances = [
  {
    title: "Pay when milestones are verified",
    description:
      "Funds stay in escrow until your punch list is signed. Every release is timestamped and documented.",
  },
  {
    title: "Licensed, regulated protection",
    description:
      "Conforma is licensed by the Texas Department of Savings and Mortgage Lending to administer residential escrow.",
  },
  {
    title: "Hands-on dispute support",
    description:
      "If something goes sideways, our coordinators intervene quickly so momentum is not lost.",
  },
];

const projectSnapshots = [
  {
    title: "Kitchen overhaul in Austin",
    description:
      "Segmented into six milestones with appliance verification photos. Cabinet delays were handled without releasing payment early.",
  },
  {
    title: "Roof replacement in Dallas",
    description:
      "Insurance proceeds were deposited once, then draws were released when the adjuster sign-off was uploaded.",
  },
  {
    title: "Outdoor living upgrade in Frisco",
    description:
      "Change orders were managed within escrow, keeping the updated pergola and lighting scope clear for both sides.",
  },
];

export default function Homeowners() {
  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow="For homeowners"
        title="Confidence from the first deposit to the final walkthrough"
        description="Use Conforma to hold funds, document progress, and release payments only when you approve the work."
        align="left"
        actions={[
          { href: "/register", label: "Create your escrow" },
          { href: "/how-it-works", label: "See how Conforma works", variant: "secondary" },
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
                <StatsCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Why homeowners choose Conforma</h2>
            <p className="mt-3 text-base text-slate-600">
              We combine licensed escrow management with hands-on project support so you never release funds without proof.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {assurances.map((assurance) => (
              <div
                key={assurance.title}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-left shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
              >
                <h3 className="text-lg font-semibold text-slate-900">{assurance.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{assurance.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">How projects stay on track</h2>
            <p className="mt-3 text-base text-slate-600">
              Real homeowners leverage Conforma to keep crews accountable while maintaining positive working relationships.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {projectSnapshots.map((snapshot) => (
              <div
                key={snapshot.title}
                className="surface-card h-full rounded-3xl border border-white/60 bg-white/90 p-6 text-left shadow-lg shadow-slate-900/10 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-slate-900">{snapshot.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{snapshot.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="surface-card mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/90 p-10 shadow-lg shadow-slate-900/10 backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">Plan your protected project</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tell us about your timeline, budget, and milestones. We will configure escrow and documentation requirements before work begins.
            </p>
            <div className="mt-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-12">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Prefer a quick call?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Email support@conforma.com or call (512) 555-1234 to speak with a Conforma specialist.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Connect with our team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

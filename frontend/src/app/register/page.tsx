import Link from "next/link";

import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";

const steps = [
  {
    title: "Share your project scope",
    description: "Tell us your timeline, budget, and the milestones you already have in mind. We customise escrow around your plan.",
  },
  {
    title: "Invite your contractor",
    description: "Conforma handles account creation for both parties and captures licenses, insurance, and banking details securely.",
  },
  {
    title: "Fund and launch",
    description: "Once agreements are signed, the homeowner funds the escrow account and work begins with milestones clearly documented.",
  },
];

const highlights = [
  {
    title: "Licensed escrow administration",
    description: "Conforma is licensed in Texas to hold and release residential construction funds on behalf of homeowners and contractors.",
  },
  {
    title: "Transparent milestone ledger",
    description: "Every approval, release, and change order is timestamped, keeping lenders, insurers, and project stakeholders aligned.",
  },
  {
    title: "Hands-on support team",
    description: "From kickoff calls to dispute facilitation, our coordinators stay engaged so momentum never stalls.",
  },
];

export default function Register() {
  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow="Get started"
        title="Launch your Conforma escrow"
        description="Submit your project details and our team will configure milestones, documentation, and funding so you can begin with confidence."
        align="left"
        actions={[
          { href: "#registration-form", label: "Submit project details" },
          { href: "/contact", label: "Talk with our team", variant: "secondary" },
        ]}
      />

      <section className="bg-white/80 py-16 md:py-24" id="registration-form">
        <div className="container px-4 md:px-6">
          <div className="surface-card mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/90 p-10 shadow-lg shadow-slate-900/10 backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">Tell us about your project</h2>
            <p className="mt-2 text-sm text-slate-600">
              Share your project scope, timeline, contractor information, and any documentation you already have prepared.
              A Conforma specialist will follow up within one business day to confirm next steps.
            </p>
            <div className="mt-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">How onboarding works</h2>
            <p className="mt-3 text-base text-slate-600">
              You do not need every detail finalised. Share what you have and we will guide you through the rest.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-left shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
              >
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Why teams trust Conforma</h2>
            <p className="mt-3 text-base text-slate-600">
              We combine regulated escrow, transparent approvals, and friendly support so your next project feels predictable from day one.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="surface-card rounded-3xl border border-white/60 bg-white/90 p-6 text-left shadow-lg shadow-slate-900/10 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-slate-900">{highlight.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-section-muted py-16">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Need help before you apply?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Review how escrow works or browse playbooks for your specific project type.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Review the process
            </Link>
            <Link
              href="/blog"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60"
            >
              Explore resources
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

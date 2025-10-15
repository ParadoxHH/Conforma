import Link from "next/link";

import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";

const contactOptions = [
  {
    title: "Email support",
    detail: "support@conforma.com",
    description: "Send project docs or questions and receive a response within one business day.",
    href: "mailto:support@conforma.com",
  },
  {
    title: "Talk with our team",
    detail: "(512) 555-1234",
    description: "Available Monday through Friday, 8 AM to 6 PM Central.",
    href: "tel:15125551234",
  },
  {
    title: "Schedule a kickoff",
    detail: "Book a milestone planning session",
    description: "We will walk through scope, documentation, and escrow setup in about 30 minutes.",
    href: "#contact-form",
  },
];

export default function Contact() {
  return (
    <main className="flex flex-col gap-0">
      <PageHero
        eyebrow="Contact Conforma"
        title="We are ready to help you launch or steady your project"
        description="Send a note, call the team, or request a guided milestone planning session. We respond quickly because momentum matters."
        align="left"
        actions={[
          { href: "#contact-form", label: "Submit your project" },
          { href: "tel:15125551234", label: "Call us now", variant: "secondary" },
        ]}
      />

      <section className="bg-white/80 py-16 md:py-24" id="contact-form">
        <div className="container px-4 md:px-6">
          <div className="surface-card mx-auto max-w-4xl rounded-3xl border border-white/60 bg-white/90 p-10 shadow-lg shadow-slate-900/10 backdrop-blur">
            <h2 className="text-2xl font-semibold text-slate-900">Tell us about your project</h2>
            <p className="mt-2 text-sm text-slate-600">
              Include timelines, contractor details, and the milestones you already have in mind. The more information you share, the faster we can respond with a tailored plan.
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
            <h2 className="text-3xl font-semibold text-slate-900">Prefer another channel?</h2>
            <p className="mt-3 text-base text-slate-600">
              We meet you where you are. Reach out using the option that works best for your schedule.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {contactOptions.map((option) => {
              const isInternal = option.href.startsWith("/");

              return (
                <div
                  key={option.title}
                  className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-left shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {option.title}
                  </p>
                  {isInternal ? (
                    <Link
                      href={option.href}
                      className="mt-3 block text-lg font-semibold text-slate-900 hover:text-primary"
                    >
                      {option.detail}
                    </Link>
                  ) : (
                    <a
                      href={option.href}
                      className="mt-3 block text-lg font-semibold text-slate-900 hover:text-primary"
                    >
                      {option.detail}
                    </a>
                  )}
                  <p className="mt-2 text-sm text-slate-600">{option.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Looking for resources first?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Explore our latest guides on escrow best practices before you reach out.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Visit the blog
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60"
            >
              Review the process
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

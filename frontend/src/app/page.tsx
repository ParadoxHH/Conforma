import { FeatureTabs } from "@/components/feature-tabs";
import { ScrollLinkedStepper } from "@/components/scroll-linked-stepper";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { FAQAccordion } from "@/components/faq-accordion";
import { FloatingHelp } from "@/components/floating-help";
import { TrustBadgeRow } from "@/components/trust-badge-row";
import { StatsCounter } from "@/components/stats-counter";
import Link from "next/link";

function Hero() {
  const stats = [
    { label: "Secured through Conforma", value: 92, prefix: "$", suffix: "M+" },
    { label: "Average release time", value: 48, suffix: " hrs" },
    { label: "Milestones paid out", value: 3200, suffix: "+" },
  ];

  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="container relative z-10 px-4 pb-16 pt-20 md:pt-28 lg:pb-24 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-primary/20">
              Licensed escrow · Texas projects only
            </span>
            <h1 className="mt-6 text-left text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-[44px] md:leading-[1.05]">
              Pay-When-Done for Texas Home Projects
            </h1>
            <p className="mt-4 max-w-xl text-left text-lg text-slate-600 md:text-xl">
              Funds are held safely in escrow. Contractors get paid only when you approve each milestone.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                Login
              </Link>
              <Link
                href="/login?mode=signup"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 px-8 text-base font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60"
              >
                Create an account
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 text-left shadow-sm shadow-slate-900/10 backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    <StatsCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </p>
                </div>
              ))}
            </div>
          </div>
          <aside className="surface-card relative overflow-hidden rounded-3xl border border-white/60 bg-white/85 p-8 shadow-lg shadow-slate-900/10 backdrop-blur">
            <div className="absolute right-[-20%] top-[-20%] h-40 w-40 rounded-full bg-primary/20 blur-2xl" aria-hidden />
            <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-sky-200/40 blur-3xl" aria-hidden />
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Escrow snapshot</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Track every milestone, approval, and payout from a single, transparent dashboard.
                </p>
              </div>
              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm shadow-slate-900/5">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Next milestone</p>
                    <p className="mt-1 font-semibold text-slate-900">Electrical rough-in</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success shadow-sm">
                    Due in 3d
                  </span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      1
                    </span>
                    Funds secured in escrow.com sandbox
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      2
                    </span>
                    Contractor uploads proof for approval
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      3
                    </span>
                    Release funds or start a dispute in 5d
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  TX
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Texas-only protection</p>
                  <p className="text-xs text-slate-500">
                    Built for Lone Star homeowners and contractors. Statewide compliance handled.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
        <div className="mt-12 flex justify-start">
          <TrustBadgeRow className="justify-start" />
        </div>
      </div>
    </section>
  );
}

function UseCaseTiles() {
  const cases = ["Roofing", "Home Improvement", "Moving", "Solar", "Tree Trimming"];
  return (
    <div className="container px-4 md:px-6">
      <h2 className="text-3xl font-bold text-center text-slate-900">Texas projects we secure every week</h2>
      <p className="mt-3 text-center text-base text-slate-600">
        Durable escrow templates tailored for the most common home improvement milestones across the state.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cases.map((c) => (
          <div
            key={c}
            className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col gap-0">
      <Hero />
      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-lg shadow-slate-900/5 backdrop-blur">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Built for both sides of the project</h2>
              <p className="mt-3 text-base text-slate-600">
                Tailored workflows for homeowners who demand certainty and contractors who value predictable cash flow.
              </p>
            </div>
            <FeatureTabs />
          </div>
        </div>
      </section>
      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <ScrollLinkedStepper />
        </div>
      </section>
      <section className="bg-white py-16 md:py-24">
        <UseCaseTiles />
      </section>
      <section className="bg-white/80 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <TestimonialCarousel />
        </div>
      </section>
      <section className="bg-section-muted py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <FAQAccordion />
        </div>
      </section>
      <FloatingHelp />
    </main>
  );
}

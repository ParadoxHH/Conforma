import { TrustBadgeRow } from "@/components/trust-badge-row";
import { FeatureTabs } from "@/components/feature-tabs";
import { ScrollLinkedStepper } from "@/components/scroll-linked-stepper";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { FAQAccordion } from "@/components/faq-accordion";
import { LeadForm } from "@/components/lead-form";
import { FloatingHelp } from "@/components/floating-help";
import Link from "next/link";

function Hero() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-slate-50">
      <div className="container px-4 md:px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Pay-When-Done for Texas Home Projects
        </h1>
        <p className="max-w-[700px] mx-auto text-slate-600 md:text-xl mt-4">
          Funds are held safely in escrow. Contractors get paid only when you approve each milestone.
        </p>
        <div className="mt-8">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

function UseCaseTiles() {
  const cases = ["Roofing", "Home Improvement", "Moving", "Solar", "Tree Trimming"];
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Perfect for any project</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cases.map((c) => (
            <div key={c} className="p-4 border rounded-lg text-center shadow-sm">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustBadgeRow />
      <section className="bg-slate-50 py-12 md:py-24">
        <FeatureTabs />
      </section>
      <ScrollLinkedStepper />
      <section className="bg-slate-50 py-12 md:py-24">
        <UseCaseTiles />
      </section>
      <TestimonialCarousel />
      <section className="bg-slate-50 py-12 md:py-24">
        <FAQAccordion />
      </section>
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Let’s make your next project safe and simple.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">Have questions or need help getting started? Fill out the form below and a member of our team will get back to you shortly.</p>
          <LeadForm />
        </div>
      </section>
      <FloatingHelp />
    </main>
  );
}

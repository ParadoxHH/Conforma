import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import LeadForm from "@/components/lead-form";
import TradesGrid from "@/components/trades-grid";
import TrustStrip from "@/components/trust-strip";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <TradesGrid />
      <LeadForm />
    </main>
  );
}
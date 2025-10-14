import { ScrollLinkedStepper } from "@/components/scroll-linked-stepper";
import { MilestoneTimeline } from "@/components/milestone-timeline";

export default function HowItWorks() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">How Conforma Works</h1>
      <p className="text-lg text-center text-slate-600 max-w-3xl mx-auto mb-16">
        Our process is designed to be simple, transparent, and secure for both homeowners and contractors.
      </p>
      <ScrollLinkedStepper />
      <div className="mt-16 relative h-[30rem]">
        <h2 className="text-3xl font-bold text-center mb-8">Milestone Timeline</h2>
        <MilestoneTimeline />
      </div>
    </div>
  );
}
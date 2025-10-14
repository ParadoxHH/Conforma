import { LeadForm } from "@/components/lead-form";

export default function Contact() {
  return (
    <div className="container mx-auto py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="text-lg text-slate-600 mt-4">We're here to help. Fill out the form below and we'll get back to you as soon as possible.</p>
      </section>

      <section className="mb-16">
        <LeadForm />
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold">Other Ways to Reach Us</h2>
        <div className="mt-8 space-y-4">
          <p>Email: <a href="mailto:support@conforma.com" className="text-primary hover:underline">support@conforma.com</a></p>
          <p>Phone: (512) 555-1234</p>
        </div>
      </section>
    </div>
  );
}

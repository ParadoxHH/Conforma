import Link from "next/link";

export default function Homeowners() {
  return (
    <div className="container mx-auto py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold">Peace of Mind for Your Home Projects</h1>
        <p className="text-lg text-slate-600 mt-4">Secure your investment and ensure your project is completed to your satisfaction.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Use Conforma?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Pay When Done</h3>
            <p>You release funds only when you are satisfied with the work.</p>
          </div>
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
            <p>Your money is held securely in a licensed escrow account.</p>
          </div>
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Dispute Resolution</h3>
            <p>We provide a fair and simple process to resolve any issues.</p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Case Studies</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Kitchen Remodel in Austin</h3>
            <p>The Johnsons used Conforma to manage their kitchen remodel, ensuring payments were made only after each phase was completed to their liking.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Roofing Project in Dallas</h3>
            <p>Maria used Conforma to hire a roofing contractor, giving her the confidence that her investment was protected.</p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold">Ready to Start Your Project?</h2>
        <div className="mt-8">
          <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

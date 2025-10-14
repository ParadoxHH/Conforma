import Link from "next/link";

export default function Contractors() {
  return (
    <div className="container mx-auto py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold">Get Paid Faster and More Securely</h1>
        <p className="text-lg text-slate-600 mt-4">Focus on your work, not on chasing payments. Conforma ensures you get paid on time, every time.</p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Use Conforma?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Guaranteed Payments</h3>
            <p>Funds are secured in escrow before you start working.</p>
          </div>
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Build Trust</h3>
            <p>Show your clients you are a professional who values transparency.</p>
          </div>
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Streamline Your Business</h3>
            <p>Reduce administrative overhead and focus on what you do best.</p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Case Studies</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Landscaping Project in Houston</h3>
            <p>David used Conforma to manage a large landscaping project, which helped him build trust with a new client and ensure timely payments.</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-xl font-bold mb-2">Solar Panel Installation in San Antonio</h3>
            <p>A solar installation company uses Conforma for all their projects to streamline their payment process and improve cash flow.</p>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold">Ready to Grow Your Business?</h2>
        <div className="mt-8">
          <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

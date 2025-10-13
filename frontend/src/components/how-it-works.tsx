import Link from 'next/link';

export default function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">A Simple, Secure Process</h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We've designed a straightforward process to protect both homeowners and contractors from start to finish.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-12 py-12 lg:grid-cols-3">
          <div className="grid gap-1 text-center">
            <div className="text-4xl font-bold text-blue-600">1</div>
            <h3 className="text-lg font-bold">Create Job & Milestones</h3>
            <p className="text-sm text-gray-600">
              The contractor defines the job scope and breaks it down into 1-3 clear milestones with set prices.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="text-4xl font-bold text-blue-600">2</div>
            <h3 className="text-lg font-bold">Homeowner Funds Escrow</h3>
            <p className="text-sm text-gray-600">
              The homeowner securely funds the total project amount into an Escrow.com account. Work begins with confidence.
            </p>
          </div>
          <div className="grid gap-1 text-center">
            <div className="text-4xl font-bold text-blue-600">3</div>
            <h3 className="text-lg font-bold">Approve & Get Paid</h3>
            <p className="text-sm text-gray-600">
              As each milestone is completed, the homeowner approves it, and funds are released to the contractor. It's that simple.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
            <Link href="/how-it-works" className="text-blue-600 hover:underline">
                Learn more about the process
            </Link>
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-blue-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Secure Your Home Project with Confidence
              </h1>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Conforma is a Texas-only escrow platform that protects homeowners and contractors. Fund your project
                securely, and we'll release payments only when you approve the work.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="/homeowners"
                className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
                prefetch={false}
              >
                I'm a Homeowner
              </Link>
              <Link
                href="/contractors"
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100"
                prefetch={false}
              >
                I'm a Contractor
              </Link>
            </div>
          </div>
          {/* Placeholder for an image or illustration */}
          <div className="hidden lg:block bg-gray-200 rounded-xl">
             {/* In a real app, you'd have an <Image> component here */}
          </div>
        </div>
      </div>
    </section>
  );
}

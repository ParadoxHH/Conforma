import { ShieldCheck, DollarSign, Users } from 'lucide-react';

export default function TrustStrip() {
  return (
    <section className="w-full bg-white py-12 md:py-16">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 text-center md:grid-cols-3 md:px-6">
        <div className="flex flex-col items-center">
          <ShieldCheck className="h-10 w-10 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold">Secure Transactions</h3>
          <p className="mt-2 text-sm text-gray-600">
            All funds are held in a secure Escrow.com account until you approve the work.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <DollarSign className="h-10 w-10 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold">Fair Payments</h3>
          <p className="mt-2 text-sm text-gray-600">
            Contractors get paid on time for approved milestones, ensuring project momentum.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Users className="h-10 w-10 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold">For Texans, By Texans</h3>
          <p className="mt-2 text-sm text-gray-600">
            Conforma is built exclusively for the Texas home services market.
          </p>
        </div>
      </div>
    </section>
  );
}

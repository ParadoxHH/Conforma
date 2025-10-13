import { Home, Hammer, Droplets, Wrench } from 'lucide-react';

const trades = [
  { name: 'Roofing', icon: <Home className="h-8 w-8" /> },
  { name: 'Remodeling', icon: <Hammer className="h-8 w-8" /> },
  { name: 'Plumbing', icon: <Droplets className="h-8 w-8" /> },
  { name: 'General Contracting', icon: <Wrench className="h-8 w-8" /> },
  // Add more trades as needed
];

export default function TradesGrid() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">For All Home Service Trades</h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              From small repairs to major renovations, Conforma is built for any home service project in Texas.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl justify-items-center gap-8 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {trades.map((trade) => (
            <div key={trade.name} className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {trade.icon}
              </div>
              <span className="text-sm font-medium">{trade.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

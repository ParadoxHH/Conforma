import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="text-lg font-bold">Conforma</h3>
          <p className="mt-2 text-sm text-gray-600">Secure escrow for Texas home services.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold">Navigate</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="/how-it-works" className="text-sm hover:underline">How It Works</Link></li>
              <li><Link href="/homeowners" className="text-sm hover:underline">For Homeowners</Link></li>
              <li><Link href="/contractors" className="text-sm hover:underline">For Contractors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Support</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="/contact" className="text-sm hover:underline">Contact Us</Link></li>
              <li><Link href="/blog" className="text-sm hover:underline">Blog</Link></li>
              <li><Link href="/faq" className="text-sm hover:underline">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div>
          <h4 className="font-semibold">Legal</h4>
          <ul className="mt-2 space-y-1">
            <li><Link href="/terms" className="text-sm hover:underline">Terms of Service</Link></li>
            <li><Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t pt-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Conforma. All rights reserved.
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <span className="text-xl font-bold">Conforma</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/how-it-works" className="text-sm font-medium hover:underline" prefetch={false}>
            How It Works
          </Link>
          <Link href="/homeowners" className="text-sm font-medium hover:underline" prefetch={false}>
            For Homeowners
          </Link>
          <Link href="/contractors" className="text-sm font-medium hover:underline" prefetch={false}>
            For Contractors
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:underline" prefetch={false}>
            Contact
          </Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/auth/login"
            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-100 px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200"
            prefetch={false}
          >
            Log In
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            prefetch={false}
          >
            Sign Up
          </Link>
        </div>
        <button className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </button>
      </div>
    </header>
  );
}

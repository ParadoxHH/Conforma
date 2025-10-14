import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Conforma</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/homeowners">For Homeowners</Link>
            <Link href="/contractors">For Contractors</Link>
            <Link href="/blog">Blog</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

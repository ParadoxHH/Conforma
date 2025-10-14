import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Conforma. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary">Terms of Service</Link>
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary">Privacy Policy</Link>
          <span className="text-sm text-muted-foreground">Texas-Only</span>
        </div>
      </div>
    </footer>
  );
}
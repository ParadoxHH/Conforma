import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Link from "next/link";

export function FloatingHelp() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="fixed bottom-4 right-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
          Need help?
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80svh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle className="text-left text-lg font-semibold text-slate-900">Conforma assistance</DrawerTitle>
          <DrawerDescription className="text-left text-sm text-slate-600">
            Quick references for contract milestones, risk automation, and support.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-6 px-4 pb-6 text-sm text-slate-700">
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contractor resources</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/how-it-works" className="text-primary hover:underline">
                  Milestones & escrow walkthrough
                </Link>
              </li>
              <li>
                <Link href="/dashboard/verification" className="text-primary hover:underline">
                  Upload insurance & licenses
                </Link>
              </li>
              <li>
                <Link href="/capture" className="text-primary hover:underline">
                  Capture evidence offline (PWA)
                </Link>
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin shortcuts</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/admin/verification" className="text-primary hover:underline">
                  Review contractor documents
                </Link>
              </li>
              <li>
                <Link href="/admin/risk" className="text-primary hover:underline">
                  Adjust risk rules & trade caps
                </Link>
              </li>
              <li>
                <Link href="/autonomy" className="text-primary hover:underline">
                  Autonomy health dashboard
                </Link>
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Need more?</h3>
            <p className="text-slate-600">
              Review our <Link href="/blog" className="text-primary hover:underline">blog guides</Link>, skim the{' '}
              <Link href="/privacy" className="text-primary hover:underline">policies</Link>, or{' '}
              <Link href="/contact" className="text-primary hover:underline">contact support</Link> for live assistance.
            </p>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Link from "next/link";

export function FloatingHelp() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-4 shadow-lg">
          Need help?
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Quick Answers</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <ul className="space-y-2">
            <li><Link href="/how-it-works" className="hover:underline">How It Works</Link></li>
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const homeownerBenefits = [
  "Pay only when work is done to your satisfaction.",
  "Securely hold funds in a licensed escrow account.",
  "Clear audit trail for all milestones and payments.",
  "Simple dispute resolution process.",
];

const contractorBenefits = [
  "Guaranteed payment upon milestone approval.",
  "Reduce administrative overhead and payment chasing.",
  "Build trust with clients through a transparent process.",
  "Get paid faster with automated fund release.",
];

export function FeatureTabs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="homeowners" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="homeowners">For Homeowners</TabsTrigger>
          <TabsTrigger value="contractors">For Contractors</TabsTrigger>
        </TabsList>
        <TabsContent value="homeowners">
          <ul className="list-disc list-inside space-y-2 p-4">
            {homeownerBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="contractors">
          <ul className="list-disc list-inside space-y-2 p-4">
            {contractorBenefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
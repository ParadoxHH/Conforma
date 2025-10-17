"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n/translation-context";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function FeatureTabs() {
  const { t, get } = useTranslation();

  const homeownerBenefits = get<string[]>("featureTabs.homeowners") ?? [];
  const contractorBenefits = get<string[]>("featureTabs.contractors") ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="homeowners" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="homeowners">{t("featureTabs.tabs.homeowners")}</TabsTrigger>
          <TabsTrigger value="contractors">{t("featureTabs.tabs.contractors")}</TabsTrigger>
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

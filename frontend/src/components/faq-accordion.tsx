import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What is escrow?", a: "Escrow is a legal arrangement in which a third party temporarily holds large sums of money or property until a particular condition has been met." },
  { q: "Why should I use Conforma?", a: "Conforma provides a secure and transparent way to manage payments for home projects, protecting both homeowners and contractors." },
  { q: "How does Conforma make money?", a: "Conforma charges a small service fee for each transaction." },
  { q: "What happens if there is a dispute?", a: "Conforma provides a simple dispute resolution process to help you resolve issues quickly and fairly." },
  { q: "Is my money safe?", a: "Yes, your funds are held securely in a licensed escrow account." },
  { q: "Can I use Conforma for any type of project?", a: "Conforma is designed for home improvement projects in Texas." },
];

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
      {faqs.map((faq, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger>{faq.q}</AccordionTrigger>
          <AccordionContent>{faq.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

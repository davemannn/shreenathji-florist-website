import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { getFaqs } from "../queries";

// Stays a Server Component — Base UI's Accordion primitive carries its own
// client boundary internally, so this wrapper doesn't need "use client".
export async function FaqAccordion() {
  const faqs = await getFaqs();

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <SectionHeading eyebrow="Need Help?" title="Frequently Asked Questions" />
      <Accordion>
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-base">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

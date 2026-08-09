import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFaqs } from "@/features/faq/queries";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about ordering, delivery, payment and returns at Shrinathji Florist.",
};

// Admin-managed (see /admin/faqs) — not baked into the build, since edits
// should show up immediately, same reasoning as the homepage.
export const dynamic = "force-dynamic";

const UNCATEGORIZED_LABEL = "General";

export default async function FaqPage() {
  const faqs = await getFaqs();

  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const key = faq.category || UNCATEGORIZED_LABEL;
    groups.set(key, [...(groups.get(key) ?? []), faq]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">Support</p>
        <h1 className="mt-3 text-3xl md:text-5xl">Frequently Asked Questions</h1>
      </div>

      {faqs.length === 0 ? (
        <p className="text-muted-foreground text-center">
          Nothing here yet — check back soon, or just reach out below.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {Array.from(groups.entries()).map(([group, items]) => (
            <div key={group}>
              {groups.size > 1 ? <h2 className="mb-3 text-lg font-semibold">{group}</h2> : null}
              <Accordion>
                {items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}

      <div className="border-border mt-12 flex flex-col items-center gap-3 rounded-xs border p-8 text-center">
        <p className="font-medium">Still have questions?</p>
        <Button variant="brand" nativeButton={false} render={<Link href="/contact" />}>
          Contact Us
        </Button>
      </div>
    </div>
  );
}

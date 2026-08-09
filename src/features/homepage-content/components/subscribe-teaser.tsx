import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSubscribeTeaser } from "../queries";

/** Real CTA into /subscriptions — previously just decorative text describing delivery cadence, not an actual subscribable offering. */
export async function SubscribeTeaser() {
  const content = await getSubscribeTeaser();

  return (
    <section className="bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-16 text-center md:px-6 lg:px-8">
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">
          {content.eyebrow}
        </p>
        <h2 className="text-3xl md:text-4xl">{content.heading}</h2>
        <p className="text-muted-foreground max-w-md text-sm md:text-base">{content.body}</p>
        <Button
          variant="brand"
          size="lg"
          className="mt-2"
          nativeButton={false}
          render={<Link href={content.ctaHref} />}
        >
          {content.ctaLabel}
        </Button>
      </div>
    </section>
  );
}

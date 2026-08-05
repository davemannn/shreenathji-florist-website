import { Clock, Flower2, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDeliveryFeatures } from "../queries";
import type { DeliveryFeature } from "../types";

const ICONS: Record<DeliveryFeature["icon"], LucideIcon> = {
  clock: Clock,
  moon: Moon,
  flower: Flower2,
};

/** Cards overlap the section above via negative margin, matching the reference's floating trust-strip treatment. */
export async function DeliveryFeaturesStrip() {
  const features = await getDeliveryFeatures();

  return (
    <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-3">
        {features.map((feature) => {
          const Icon = ICONS[feature.icon];
          return (
            <div
              key={feature.id}
              className="bg-background flex flex-col items-center gap-3 rounded-xs border p-8 text-center shadow-sm"
            >
              <div className="bg-brand/10 text-brand flex size-14 items-center justify-center rounded-full">
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

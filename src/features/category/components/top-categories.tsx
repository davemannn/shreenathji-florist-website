import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { getFeaturedCategories } from "../queries";

export async function TopCategories() {
  const categories = await getFeaturedCategories();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <SectionHeading eyebrow="Browse" title="Top Categories" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className="group flex flex-col items-center gap-3"
          >
            <PlaceholderImage
              label={category.imageAlt}
              className="aspect-square w-full rounded-full transition-transform group-hover:scale-[1.03]"
            />
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

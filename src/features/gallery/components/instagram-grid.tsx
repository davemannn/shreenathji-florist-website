import { SectionHeading } from "@/components/shared/section-heading";
import { ContentImage } from "@/components/shared/content-image";
import { getGalleryImages } from "../queries";

export async function InstagramGrid() {
  const images = await getGalleryImages();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <SectionHeading
        eyebrow="#SendHappy"
        title="Follow Us on Instagram"
        description="Instagram-worthy stems that look good from any angle."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {images.map((image) => (
          <a
            key={image.id}
            href={image.href}
            target="_blank"
            rel="noreferrer noopener"
            className="block"
          >
            <ContentImage
              src={image.imageUrl}
              alt={image.imageAlt}
              className="aspect-square"
              sizes="(min-width: 1024px) 16vw, 33vw"
            />
          </a>
        ))}
      </div>
    </section>
  );
}

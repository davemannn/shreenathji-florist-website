import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { CategoryWithMeta } from "../queries";

export function CategoryHeader({ category }: { category: CategoryWithMeta }) {
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name },
        ]}
      />
      <h1 className="text-3xl md:text-4xl">{category.name}</h1>
      {category.description ? (
        <p className="text-muted-foreground max-w-2xl text-sm">{category.description}</p>
      ) : null}
    </div>
  );
}

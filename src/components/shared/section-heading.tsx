import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** Eyebrow + heading + short brand-colored divider, reused across every homepage section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl md:text-4xl">{title}</h2>
      <span className="bg-brand h-[3px] w-[60px]" aria-hidden="true" />
      {description ? (
        <p className="text-muted-foreground max-w-xl text-sm md:text-base">{description}</p>
      ) : null}
    </div>
  );
}

import { Fragment } from "react";

/**
 * Deliberately not a full markdown renderer (no remark/react-markdown
 * dependency for this) — seeded post content only ever uses paragraphs and
 * `**bold**` spans, so a tiny bespoke parser covers it without pulling in a
 * library for two syntax rules.
 */
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={`${keyPrefix}-${index}`}>{part}</Fragment>;
  });
}

export function PostContent({ content }: { content: string }) {
  const paragraphs = content.trim().split(/\n\s*\n/);

  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-muted-foreground leading-relaxed">
          {renderInline(paragraph, `p${index}`)}
        </p>
      ))}
    </div>
  );
}

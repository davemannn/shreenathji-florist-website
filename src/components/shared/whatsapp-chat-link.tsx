import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "./whatsapp-icon";
import { cn } from "@/lib/utils";

/**
 * A wa.me click-to-chat link — not full ordering-over-WhatsApp, just a
 * persistent, low-effort entry point into the channel local florists
 * actually close last-minute and corporate orders through. `message`
 * pre-fills the chat (e.g. the product being viewed) so a customer isn't
 * starting from a blank message.
 */
export function WhatsAppChatLink({
  message,
  className,
  children,
}: {
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const href = message
    ? `${siteConfig.contact.whatsappHref}?text=${encodeURIComponent(message)}`
    : siteConfig.contact.whatsappHref;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />
      {children}
    </a>
  );
}

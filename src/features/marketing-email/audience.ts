import {
  getCustomerOrderStats,
  listCustomersForMarketing,
} from "@/server/repositories/user.repository";
import { listConfirmedSubscribers } from "@/server/repositories/newsletter.repository";
import { computeCustomerSegment, type CustomerSegment } from "@/features/customer/segment";
import type { AudienceKey } from "./types";

export interface ResolvedRecipient {
  email: string;
  name: string;
  /** Present only for a customer reached via a segment — the unsubscribe link signs this into a token (see marketing-unsubscribe-token.ts) rather than needing a stored token column. */
  userId?: string;
  /** Present only for a newsletter subscriber — their own stored unsubscribe token, reused as-is. */
  newsletterUnsubscribeToken?: string;
}

/**
 * Turns the audience picker's selections into a deduplicated recipient
 * list (by email — a customer who's both a newsletter subscriber and in a
 * targeted segment is only emailed once). Shared by the "how many people
 * is this" preview and the actual send, so they can never disagree.
 */
export async function resolveAudience(audiences: AudienceKey[]): Promise<ResolvedRecipient[]> {
  const recipients = new Map<string, ResolvedRecipient>();

  if (audiences.includes("newsletter")) {
    const subscribers = await listConfirmedSubscribers();
    for (const subscriber of subscribers) {
      if (!recipients.has(subscriber.email)) {
        recipients.set(subscriber.email, {
          email: subscriber.email,
          name: "there",
          newsletterUnsubscribeToken: subscriber.unsubscribeToken,
        });
      }
    }
  }

  const wantedSegments = new Set(
    audiences
      .filter((a): a is `segment:${CustomerSegment}` => a.startsWith("segment:"))
      .map((a) => a.slice("segment:".length) as CustomerSegment),
  );

  if (wantedSegments.size > 0) {
    const customers = await listCustomersForMarketing();
    const stats = await getCustomerOrderStats(customers.map((c) => c.id));

    for (const customer of customers) {
      const customerStats = stats.get(customer.id) ?? {
        lifetimeSpent: 0,
        lifetimeOrderCount: 0,
        lastOrderAt: null,
      };
      const segment = computeCustomerSegment(customerStats);
      if (!wantedSegments.has(segment)) continue;

      // A segment match wins over an existing newsletter-only entry for
      // the same email — it carries the userId the unsubscribe link needs.
      recipients.set(customer.email, {
        email: customer.email,
        name: customer.name,
        userId: customer.id,
      });
    }
  }

  return Array.from(recipients.values());
}

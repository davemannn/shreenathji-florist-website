import {
  listConfirmedSubscribers as listConfirmedSubscribersRepo,
  listNewsletterSubscribersAdmin as listNewsletterSubscribersAdminRepo,
} from "@/server/repositories/newsletter.repository";

/** The audience the marketing sender (features/marketing-email) actually targets when "Newsletter" is picked. */
export async function getConfirmedSubscriberCount(): Promise<number> {
  const subscribers = await listConfirmedSubscribersRepo();
  return subscribers.length;
}

export async function listConfirmedSubscriberEmails(): Promise<string[]> {
  const subscribers = await listConfirmedSubscribersRepo();
  return subscribers.map((s) => s.email);
}

export async function listNewsletterSubscribersAdmin(page = 1) {
  const { subscribers, total, pageSize } = await listNewsletterSubscribersAdminRepo({ page });
  return {
    subscribers: subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      isConfirmed: s.isConfirmed,
      subscribedAt: s.subscribedAt.toISOString(),
      unsubscribedAt: s.unsubscribedAt?.toISOString(),
    })),
    total,
    page,
    pageSize,
  };
}

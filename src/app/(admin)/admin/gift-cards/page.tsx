import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { can } from "@/server/auth/permissions";
import { listGiftCardsAdmin } from "@/features/gift-card/queries";
import { GiftCardsTable } from "@/features/gift-card/components/gift-cards-table";
import { IssueGiftCardDialog } from "@/features/gift-card/components/issue-gift-card-dialog";
import { SearchInput } from "@/components/shared/search-input";

export const metadata: Metadata = {
  title: "Gift Cards",
};

export default async function AdminGiftCardsPage({ searchParams }: PageProps<"/admin/gift-cards">) {
  const session = await requireAdminSession("gift_cards:view");
  const canIssue = can(session.role, "gift_cards:issue");

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;

  const giftCards = await listGiftCardsAdmin({ search });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gift Cards</h1>
          <p className="text-muted-foreground text-sm">{giftCards.length} gift cards</p>
        </div>
        {canIssue ? <IssueGiftCardDialog /> : null}
      </div>

      <SearchInput
        basePath="/admin/gift-cards"
        search={search}
        placeholder="Code, recipient, or purchaser email…"
      />

      <GiftCardsTable giftCards={giftCards} />
    </div>
  );
}

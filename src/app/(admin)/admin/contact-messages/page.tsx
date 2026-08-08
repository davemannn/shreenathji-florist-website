import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listContactMessagesAdmin } from "@/features/contact/queries";
import { ContactMessagesTable } from "@/features/contact/components/contact-messages-table";
import { Pagination } from "@/components/shared/pagination";
import { PAGE_SIZE_OPTIONS, parsePageSize } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Contact Messages",
};

export default async function ContactMessagesPage({
  searchParams,
}: PageProps<"/admin/contact-messages">) {
  await requireAdminSession("customers:view");

  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const pageSize = parsePageSize(params.pageSize);

  const {
    messages,
    total,
    unreadCount,
    pageSize: resolvedPageSize,
  } = await listContactMessagesAdmin({ page, pageSize });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Contact Messages</h1>
        <p className="text-muted-foreground text-sm">
          {total} message{total === 1 ? "" : "s"} from the /contact page
          {unreadCount > 0 ? ` — ${unreadCount} unread` : ""}
        </p>
      </div>

      <ContactMessagesTable messages={messages} />

      <Pagination
        basePath="/admin/contact-messages"
        page={page}
        pageSize={resolvedPageSize}
        total={total}
        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
      />
    </div>
  );
}

import Link from "next/link";
import type { ActivityItem } from "../types";

const ACTION_VERB: Record<string, string> = {
  created: "created",
  updated: "updated",
  archived: "archived",
  restored: "restored",
  deleted: "deleted",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No recent activity.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
          <div>
            <span className="font-medium">{item.changedByName}</span>{" "}
            <span className="text-muted-foreground">
              {ACTION_VERB[item.action] ?? item.action} {item.entityType.toLowerCase()}
            </span>{" "}
            <span className="font-medium">&ldquo;{item.entityLabel}&rdquo;</span>
            <p className="text-muted-foreground text-xs">{item.summary}</p>
          </div>
          <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
            {timeAgo(item.createdAt)}
          </span>
        </li>
      ))}
      <Link href="/admin/audit-log" className="text-brand text-xs hover:underline">
        View full audit log →
      </Link>
    </ul>
  );
}

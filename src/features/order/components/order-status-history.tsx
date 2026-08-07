import { ORDER_STATUS_LABELS } from "../status-transitions";
import type { OrderStatusHistoryEntry } from "../types";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function OrderStatusHistoryList({ entries }: { entries: OrderStatusHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">No status changes yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col gap-0.5 border-l-2 pl-3">
          <p className="text-sm">
            {entry.fromStatus ? (
              <>
                <span className="text-muted-foreground">
                  {ORDER_STATUS_LABELS[entry.fromStatus]}
                </span>
                {" → "}
              </>
            ) : null}
            <span className="font-medium">{ORDER_STATUS_LABELS[entry.toStatus]}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            {entry.changedByName} ({entry.changedByRole}) · {formatTimestamp(entry.createdAt)}
          </p>
          {entry.note ? <p className="text-muted-foreground text-xs italic">{entry.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}

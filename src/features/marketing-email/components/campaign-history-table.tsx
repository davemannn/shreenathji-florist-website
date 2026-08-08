import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { AdminEmailCampaign } from "../types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CampaignHistoryTable({ campaigns }: { campaigns: AdminEmailCampaign[] }) {
  if (campaigns.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No campaigns sent yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Audience</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Sent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell className="font-medium">{campaign.subject}</TableCell>
            <TableCell className="text-muted-foreground text-xs">{campaign.audience}</TableCell>
            <TableCell>{campaign.recipientCount}</TableCell>
            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
              {formatDateTime(campaign.createdAt)} · {campaign.createdByName}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

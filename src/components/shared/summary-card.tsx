export function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border rounded-md border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

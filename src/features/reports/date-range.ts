import { toIsoDate } from "@/lib/delivery";

export interface ResolvedDateRange {
  from: Date;
  to: Date;
  fromIso: string;
  toIso: string;
}

/** Defaults to the last 30 days (inclusive) when no from/to searchParams are given. */
export function resolveDateRange(params: { from?: string; to?: string }): ResolvedDateRange {
  const now = new Date();
  const toIso = params.to ?? toIsoDate(now);

  const defaultFrom = new Date(now);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  const fromIso = params.from ?? toIsoDate(defaultFrom);

  return {
    from: new Date(`${fromIso}T00:00:00.000Z`),
    to: new Date(`${toIso}T23:59:59.999Z`),
    fromIso,
    toIso,
  };
}

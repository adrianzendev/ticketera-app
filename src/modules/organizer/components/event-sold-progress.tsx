import { formatNumber, type EventMetrics } from "@/modules/organizer/services/organizer.service";

export function EventSoldLabel({ metrics }: { metrics: EventMetrics }) {
  return (
    <span className="text-[13px] tabular-nums">
      <strong className="font-semibold">{formatNumber(metrics.sold)}</strong>{" "}
      <span className="text-zinc-600">/ {formatNumber(metrics.capacity)} vendidas</span>
    </span>
  );
}

export function EventSoldProgress({
  metrics,
  showLabel = true,
}: {
  metrics: EventMetrics;
  showLabel?: boolean;
}) {
  const bar = (
    <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-zinc-100">
      <span
        className="block h-full rounded-full bg-primary"
        style={{ width: `${Math.round(metrics.soldRatio * 100)}%` }}
      />
    </span>
  );

  if (!showLabel) return bar;

  return (
    <span className="flex flex-col gap-1.5">
      <EventSoldLabel metrics={metrics} />
      {bar}
    </span>
  );
}

import { formatEventDateShort } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  EventRevenue,
  EventStatusBadge,
  getEventAction,
} from "@/modules/organizer/components/event-status-badge";
import { EventSoldLabel, EventSoldProgress } from "@/modules/organizer/components/event-sold-progress";
import { OrganizerEventImage } from "@/modules/organizer/components/organizer-event-image";
import type { OrganizerEvent } from "@/modules/organizer/schemas/organizer-event.schema";
import { getEventMetrics } from "@/modules/organizer/services/organizer.service";

function OrganizerEventCard({
  event,
  highlighted,
  onAction,
}: {
  event: OrganizerEvent;
  highlighted: boolean;
  onAction: () => void;
}) {
  const metrics = getEventMetrics(event);
  const { label, ariaLabel } = getEventAction(event.status, event.title);

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-[20px] bg-white p-3.5",
        highlighted ? "border-2 border-primary" : "border border-zinc-200",
      )}
    >
      <div className="flex items-center gap-3">
        <OrganizerEventImage
          src={event.imageUrl}
          sizes="52px"
          className="size-[52px] shrink-0 rounded-xl"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[15px] font-semibold">{event.title}</span>
          <span className="truncate text-xs text-zinc-600">
            {`${formatEventDateShort(event.startDate)} · ${event.city}`}
          </span>
        </div>
        <EventStatusBadge status={event.status} className="h-[26px] px-2.5 text-[11px]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 text-[13px] tabular-nums">
          <EventSoldLabel metrics={metrics} />
          <strong className="font-semibold">
            <EventRevenue status={event.status} revenue={metrics.revenue} />
          </strong>
        </div>
        <EventSoldProgress metrics={metrics} showLabel={false} />
      </div>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onAction}
        className="flex h-11 items-center justify-center rounded-xl border-[1.5px] border-zinc-300 text-sm font-semibold outline-none hover:bg-zinc-50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {label}
      </button>
    </li>
  );
}

export function OrganizerEventCards({
  events,
  highlightedId,
  onAction,
}: {
  events: ReadonlyArray<OrganizerEvent>;
  highlightedId: string | null;
  onAction: () => void;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {events.map((event) => (
        <OrganizerEventCard
          key={event.id}
          event={event}
          highlighted={event.id === highlightedId}
          onAction={onAction}
        />
      ))}
    </ul>
  );
}

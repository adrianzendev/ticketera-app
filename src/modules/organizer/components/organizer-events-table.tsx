"use client";

import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { useMemo } from "react";

import { formatEventDateShort } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  EventRevenue,
  EventStatusBadge,
  getEventAction,
} from "@/modules/organizer/components/event-status-badge";
import { EventSoldProgress } from "@/modules/organizer/components/event-sold-progress";
import { OrganizerEventImage } from "@/modules/organizer/components/organizer-event-image";
import type { OrganizerEvent } from "@/modules/organizer/schemas/organizer-event.schema";
import { getEventMetrics } from "@/modules/organizer/services/organizer.service";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, OrganizerEvent>();

// El filtro por estado se aplica antes con filterEventsByStatus: la tabla no registra features.
const COLUMN_CLASS_NAMES: Record<string, { th: string; td: string }> = {
  event: { th: "pl-6 text-left", td: "pl-6" },
  status: { th: "w-[130px] pl-4 text-left", td: "pl-4" },
  sold: { th: "w-[260px] pl-4 text-left", td: "pl-4" },
  revenue: {
    th: "w-[150px] pl-4 text-right",
    td: "pl-4 text-right font-semibold tabular-nums",
  },
  actions: { th: "w-[140px] pr-6 pl-4", td: "pr-6 pl-4 text-right" },
};

function getRowId(event: OrganizerEvent) {
  return event.id;
}

export function OrganizerEventsTable({
  events,
  highlightedId,
  onAction,
}: {
  events: ReadonlyArray<OrganizerEvent>;
  highlightedId: string | null;
  onAction: () => void;
}) {
  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("title", {
          id: "event",
          header: "Evento",
          cell: ({ row }) => {
            const event = row.original;
            return (
              <span className="flex min-w-0 items-center gap-3.5">
                <OrganizerEventImage
                  src={event.imageUrl}
                  sizes="52px"
                  className="size-[52px] shrink-0 rounded-xl"
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-semibold">{event.title}</span>
                  <span className="truncate text-[13px] text-zinc-600">
                    {`${formatEventDateShort(event.startDate)} · ${event.city}`}
                  </span>
                </span>
              </span>
            );
          },
        }),
        columnHelper.accessor("status", {
          header: "Estado",
          cell: (info) => <EventStatusBadge status={info.getValue()} />,
        }),
        columnHelper.accessor(getEventMetrics, {
          id: "sold",
          header: "Vendidas",
          cell: (info) => <EventSoldProgress metrics={info.getValue()} />,
        }),
        columnHelper.accessor((event) => getEventMetrics(event).revenue, {
          id: "revenue",
          header: "Ingresos",
          cell: (info) => (
            <EventRevenue status={info.row.original.status} revenue={info.getValue()} />
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: () => <span className="sr-only">Acciones</span>,
          cell: ({ row }) => {
            const { label, ariaLabel } = getEventAction(row.original.status, row.original.title);
            return (
              <button
                type="button"
                aria-label={ariaLabel}
                onClick={onAction}
                className="inline-flex h-10 items-center rounded-[11px] border-[1.5px] border-zinc-300 px-3.5 text-[13px] font-semibold outline-none hover:bg-zinc-50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {label}
              </button>
            );
          },
        }),
      ]),
    [onAction],
  );

  const table = useTable({ features, columns, data: events, getRowId });

  return (
    <table className="w-full table-fixed text-sm">
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th
                key={header.id}
                scope="col"
                className={cn(
                  "py-3 text-xs font-semibold tracking-[0.04em] text-zinc-600 uppercase",
                  COLUMN_CLASS_NAMES[header.column.id]?.th,
                )}
              >
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className={cn(
              "border-t border-zinc-100",
              row.id === highlightedId && "bg-indigo-50/60",
            )}
          >
            {row.getAllCells().map((cell) => (
              <td
                key={cell.id}
                className={cn("py-3.5 align-middle", COLUMN_CLASS_NAMES[cell.column.id]?.td)}
              >
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { cn } from "@/lib/utils";
import type { OrganizerEventStatus } from "@/modules/organizer/schemas/organizer-event.schema";
import { formatSoles } from "@/modules/organizer/services/organizer.service";

const STATUS_BADGE: Record<OrganizerEventStatus, { label: string; className: string }> = {
  published: { label: "Publicado", className: "bg-green-100 text-green-800" },
  draft: { label: "Borrador", className: "bg-zinc-100 text-zinc-700" },
};

export function EventStatusBadge({
  status,
  className,
}: {
  status: OrganizerEventStatus;
  className?: string;
}) {
  const { label, className: statusClassName } = STATUS_BADGE[status];

  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full px-3 text-xs font-semibold",
        statusClassName,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function getEventAction(
  status: OrganizerEventStatus,
  title: string,
): { label: string; ariaLabel: string } {
  return status === "published"
    ? { label: "Ver ventas", ariaLabel: `Ver ventas de ${title}` }
    : { label: "Editar", ariaLabel: `Editar ${title}` };
}

export function EventRevenue({
  status,
  revenue,
}: {
  status: OrganizerEventStatus;
  revenue: number;
}) {
  if (status === "draft") {
    return (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">Sin ingresos</span>
      </>
    );
  }

  return formatSoles(revenue);
}

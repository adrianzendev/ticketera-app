import { cn } from "@/lib/utils";

import type { EventFormPreview } from "../services/event-form.service";
import { formatSoles } from "../services/organizer.service";
import { OrganizerEventImage } from "./organizer-event-image";

const TITLE_PLACEHOLDER = "Nombre del evento";
const PLACE_PLACEHOLDER = "Lugar · Ciudad";

function formatMinPrice(minPrice: number | null): string {
  return minPrice === null ? "S/ —" : formatSoles(minPrice);
}

function DateBadge({
  preview,
  compact = false,
}: {
  preview: EventFormPreview;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "absolute flex flex-col items-center bg-white shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)]",
        compact
          ? "top-2 left-2 w-11 rounded-[11px] pt-1 pb-[5px]"
          : "top-3 left-3 w-14 rounded-[14px] pt-1.5 pb-[7px]",
      )}
    >
      <span
        className={cn(
          "font-bold tracking-[0.08em] text-primary uppercase",
          compact ? "text-[10px]" : "text-[11px]",
        )}
      >
        {preview.month ?? "MES"}
      </span>
      <span
        className={cn("leading-[1.05] font-bold text-foreground", compact ? "text-[17px]" : "text-[22px]")}
      >
        {preview.day ?? "--"}
      </span>
    </span>
  );
}

const halfCircleClassName = "absolute size-5 rounded-full border border-zinc-200 bg-zinc-100";

function DesktopPreview({ preview, imageUrl }: { preview: EventFormPreview; imageUrl: string | null }) {
  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <div className="relative flex flex-col overflow-hidden rounded-[22px] border border-zinc-200 bg-white">
        <div className="relative h-[180px]">
          <OrganizerEventImage
            src={imageUrl}
            sizes="340px"
            className="absolute inset-0"
            iconClassName="size-[34px]"
          />
          <DateBadge preview={preview} />
        </div>

        <div className="flex flex-col gap-2 px-5 pt-[18px]">
          <span className="text-xs font-semibold tracking-[0.06em] text-primary uppercase">
            {preview.categoryName}
          </span>
          <span
            className={cn(
              "min-h-[46px] text-[17px] font-semibold break-words",
              preview.title === null && "text-zinc-500",
            )}
          >
            {preview.title ?? TITLE_PLACEHOLDER}
          </span>
          <span className="text-sm text-zinc-600">{preview.place ?? PLACE_PLACEHOLDER}</span>
        </div>

        <span className="relative mt-[18px] block h-0 border-t-[1.5px] border-dashed border-zinc-300">
          <span className={cn(halfCircleClassName, "-top-2.5 -left-2.5")} />
          <span className={cn(halfCircleClassName, "-top-2.5 -right-2.5")} />
        </span>

        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-5">
          <span className="flex flex-col">
            <span className="text-xs text-zinc-600">Desde</span>
            <span className="text-[19px] font-bold text-orange-700 tabular-nums">
              {formatMinPrice(preview.minPrice)}
            </span>
          </span>
          <span className="flex h-11 items-center rounded-xl border-[1.5px] border-zinc-900 px-4 text-sm font-semibold">
            Ver entradas
          </span>
        </div>
      </div>
      <p className="text-[13px] text-zinc-600">Así verán tu evento los compradores en el listado.</p>
    </div>
  );
}

function MobilePreview({ preview, imageUrl }: { preview: EventFormPreview; imageUrl: string | null }) {
  return (
    <div className="flex h-[132px] overflow-hidden rounded-[20px] border border-zinc-200 bg-white lg:hidden">
      <div className="relative w-[108px] shrink-0">
        <OrganizerEventImage
          src={imageUrl}
          sizes="108px"
          className="absolute inset-0"
          iconClassName="size-[26px]"
        />
        <DateBadge preview={preview} compact />
      </div>
      <div className="relative flex min-w-0 grow flex-col gap-1 border-l-[1.5px] border-dashed border-zinc-300 px-3.5 py-3">
        <span className={cn(halfCircleClassName, "-top-2.5 -left-2.5")} />
        <span className={cn(halfCircleClassName, "-bottom-2.5 -left-2.5")} />
        <span className="text-[11px] font-semibold tracking-[0.06em] text-primary uppercase">
          {preview.categoryName}
        </span>
        <span
          className={cn(
            "line-clamp-2 text-[15px] leading-[1.3] font-semibold break-words",
            preview.title === null && "text-zinc-500",
          )}
        >
          {preview.title ?? TITLE_PLACEHOLDER}
        </span>
        <span className="truncate text-xs text-zinc-600">{preview.place ?? PLACE_PLACEHOLDER}</span>
        <span className="mt-auto flex items-baseline gap-1.5">
          <span className="text-xs text-zinc-600">Desde</span>
          <span className="text-base font-bold text-orange-700 tabular-nums">
            {formatMinPrice(preview.minPrice)}
          </span>
        </span>
      </div>
    </div>
  );
}

export function EventPreviewCard({
  preview,
  imageUrl,
}: {
  preview: EventFormPreview;
  imageUrl: string | null;
}) {
  return (
    <>
      <DesktopPreview preview={preview} imageUrl={imageUrl} />
      <MobilePreview preview={preview} imageUrl={imageUrl} />
    </>
  );
}

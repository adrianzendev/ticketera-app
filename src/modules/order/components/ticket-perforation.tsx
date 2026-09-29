import { cn } from "@/lib/utils";

export function TicketPerforation({
  orientation = "responsive",
  className,
}: {
  orientation?: "horizontal" | "responsive";
  className?: string;
}) {
  const responsive = orientation === "responsive";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative shrink-0 border-t-[1.5px] border-dashed border-zinc-300",
        responsive && "lg:border-t-0 lg:border-l-[1.5px]",
        className,
      )}
    >
      <span className="absolute -top-3 -left-3 size-6 rounded-full border border-zinc-200 bg-zinc-100" />
      <span
        className={cn(
          "absolute -top-3 -right-3 size-6 rounded-full border border-zinc-200 bg-zinc-100",
          responsive && "lg:top-auto lg:right-auto lg:-bottom-3 lg:-left-3",
        )}
      />
    </div>
  );
}

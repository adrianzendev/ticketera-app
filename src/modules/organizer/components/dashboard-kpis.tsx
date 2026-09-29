import { CalendarDays, ChartColumn, Ticket, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  formatNumber,
  formatSoles,
  type DashboardKpis as DashboardKpisValues,
} from "@/modules/organizer/services/organizer.service";

function KpiCard({
  icon: Icon,
  label,
  value,
  className,
  valueClassName,
}: {
  icon: LucideIcon;
  label: ReactNode;
  value: ReactNode;
  className?: string;
  valueClassName: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-[20px] border border-zinc-200 bg-white p-[18px] lg:gap-2 lg:rounded-[22px] lg:p-6",
        className,
      )}
    >
      <dt className="flex items-center gap-2 text-[13px] text-zinc-600 lg:text-sm">
        <Icon className="hidden size-[17px] lg:block" aria-hidden="true" />
        {label}
      </dt>
      <dd
        className={cn(
          "font-bold tracking-tight tabular-nums lg:text-[32px] lg:leading-tight",
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function DashboardKpis({ kpis }: { kpis: DashboardKpisValues }) {
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
      <KpiCard
        icon={Ticket}
        label="Entradas vendidas"
        value={formatNumber(kpis.sold)}
        valueClassName="text-[22px]"
      />
      <KpiCard
        icon={ChartColumn}
        label="Ingresos"
        value={formatSoles(kpis.revenue)}
        className="order-first col-span-2 lg:order-none lg:col-span-1"
        valueClassName="text-[28px]"
      />
      <KpiCard
        icon={CalendarDays}
        label={
          <>
            <span className="lg:hidden">Publicados</span>
            <span className="hidden lg:inline">Eventos publicados</span>
          </>
        }
        value={kpis.published}
        valueClassName="text-[22px]"
      />
    </dl>
  );
}

import { Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const BRAND_IMAGE_SRC =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop";
const BRAND_IMAGE_ALT =
  "Multitud con las manos en alto frente a un escenario con luces doradas durante un festival nocturno";
const TITLE = "Tus entradas, siempre a mano.";
const SUBTITLE = "Compra en minutos y lleva tu QR en el celular.";

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("flex w-fit items-center text-white", compact ? "gap-2" : "gap-2.5")}
    >
      <span
        className={cn(
          "flex items-center justify-center bg-white text-primary",
          compact ? "size-8 rounded-[10px]" : "size-[38px] rounded-[11px]",
        )}
      >
        <Ticket className={compact ? "size-[17px]" : "size-5"} aria-hidden="true" />
      </span>
      <span className={cn("font-bold tracking-tight", compact ? "text-lg" : "text-[21px]")}>
        Ticketera
      </span>
    </Link>
  );
}

export function AuthBrandPanel() {
  return (
    <div className="bg-indigo-950 text-white">
      <div className="hidden flex-col gap-8 p-10 lg:flex">
        <BrandLogo />
        <Image
          src={BRAND_IMAGE_SRC}
          alt={BRAND_IMAGE_ALT}
          width={1200}
          height={880}
          sizes="(min-width: 1280px) 560px, 50vw"
          className="h-[440px] w-full rounded-[28px] object-cover"
        />
        <div className="flex flex-col gap-2.5">
          <p className="text-[34px] leading-[1.15] font-bold tracking-tight">{TITLE}</p>
          <p className="text-base leading-normal text-indigo-200">{SUBTITLE}</p>
        </div>
      </div>

      <div className="relative flex h-[210px] flex-col justify-between overflow-hidden p-4 lg:hidden">
        <Image
          src={BRAND_IMAGE_SRC}
          alt=""
          width={340}
          height={420}
          sizes="170px"
          className="absolute top-0 right-0 h-full w-[170px] rounded-bl-[40px] object-cover"
        />
        <div className="relative">
          <BrandLogo compact />
        </div>
        <div className="relative flex w-[190px] flex-col gap-1.5">
          <p className="text-[22px] leading-[1.2] font-bold tracking-tight">{TITLE}</p>
          <p className="text-[13px] leading-[1.45] text-indigo-200">{SUBTITLE}</p>
        </div>
      </div>
    </div>
  );
}

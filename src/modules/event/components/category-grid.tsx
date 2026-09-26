import Link from "next/link";
import {
  Clapperboard,
  Drama,
  Mic2,
  Music,
  PartyPopper,
  Palette,
  Users,
  Volleyball,
  type LucideIcon,
} from "lucide-react";

import { categories } from "@/modules/event/data/categories.mock";

const iconMap: Record<string, LucideIcon> = {
  Music,
  Volleyball,
  Drama,
  PartyPopper,
  Users,
  Clapperboard,
  Mic2,
  Palette,
};

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
      {categories.map((category) => {
        const Icon = iconMap[category.icon] ?? Music;
        const [bgClass, textClass] = category.colorClass.split(" ");
        return (
          <Link
            key={category.id}
            href={`#${category.slug}`}
            id={category.slug}
            className={`flex h-[168px] flex-col items-start justify-between rounded-3xl p-5 text-left transition-transform hover:-translate-y-1 hover:shadow-md ${bgClass}`}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white">
              <Icon className={`size-6 ${textClass}`} />
            </span>
            <span className="text-base font-semibold text-foreground">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

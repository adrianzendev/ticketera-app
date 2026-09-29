import { ImagePlus } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function OrganizerEventImage({
  src,
  sizes,
  className,
  iconClassName,
}: {
  src: string | null;
  sizes: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-indigo-100 text-indigo-700", className)}>
      {src ? (
        // Las portadas locales son data URLs: el optimizador de next/image no las procesa.
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          unoptimized={src.startsWith("data:")}
          className="object-cover"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <ImagePlus className={cn("size-6", iconClassName)} aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

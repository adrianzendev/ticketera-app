import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const FORM_CONTROL_CLASS_NAME =
  "h-[52px] rounded-[14px] border-zinc-300 bg-white px-4 text-base md:text-base lg:text-[15px]";

export function getDescribedBy(
  id: string,
  { hint, error }: { hint?: string; error?: string },
): string | undefined {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export type FormFieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: string;
  labelAction?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  hint,
  labelAction,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {labelAction}
      </div>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ValidateResult } from "@/hooks/use-validated-form";
import { cn } from "@/lib/utils";
import { getAuthErrorMessage } from "@/modules/auth/services/auth.service";

const controlClassName =
  "h-[52px] rounded-[14px] border-zinc-300 bg-white px-4 text-base md:text-base lg:text-[15px]";

type FieldFrameProps = {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: string;
  labelAction?: ReactNode;
};

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function FieldFrame({
  id,
  label,
  error,
  hint,
  labelAction,
  children,
}: FieldFrameProps & { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
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

export function AuthTextField({
  id,
  label,
  error,
  labelAction,
  className,
  ...inputProps
}: Omit<FieldFrameProps, "hint"> & Omit<ComponentProps<"input">, "id">) {
  return (
    <FieldFrame id={id} label={label} error={error} labelAction={labelAction}>
      <Input
        {...inputProps}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, undefined, error)}
        className={cn(controlClassName, className)}
      />
    </FieldFrame>
  );
}

export function AuthPasswordField({
  id,
  label,
  error,
  hint,
  labelAction,
  className,
  ...inputProps
}: FieldFrameProps & Omit<ComponentProps<"input">, "id" | "type">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <FieldFrame id={id} label={label} error={error} hint={hint} labelAction={labelAction}>
      <div className="relative flex">
        <Input
          {...inputProps}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(controlClassName, "pr-14", className)}
        />
        <button
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          // Con el mouse, evita que el input pierda el foco (y marque el campo como tocado).
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((current) => !current)}
          className="absolute top-1 right-1 flex size-11 items-center justify-center rounded-[10px] text-zinc-600 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <Icon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </FieldFrame>
  );
}

type AuthFormProps<F extends string> = {
  idPrefix: "login" | "register";
  title: string;
  description: string;
  validate: () => ValidateResult<unknown, F>;
  submit: () => Promise<unknown>;
  onSuccess: () => void;
  submitLabel: string;
  submittingLabel: string;
  footer: ReactNode;
  children: ReactNode;
};

// Envío común de login y registro: validación con foco al primer campo inválido,
// estado de envío y error del servicio.
export function AuthForm<F extends string>({
  idPrefix,
  title,
  description,
  validate,
  submit,
  onSuccess,
  submitLabel,
  submittingLabel,
  footer,
  children,
}: AuthFormProps<F>) {
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [serviceError, setServiceError] = useState<string | null>(null);
  const submitting = status === "submitting";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setServiceError(null);

    // flushSync para que aria-invalid y los mensajes ya estén en el DOM cuando el lector anuncie el foco.
    let result!: ValidateResult<unknown, F>;
    flushSync(() => {
      result = validate();
    });
    if (!result.success) {
      document.getElementById(`${idPrefix}-${result.firstInvalidField}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      await submit();
    } catch (error) {
      setStatus("idle");
      setServiceError(getAuthErrorMessage(error));
      return;
    }
    onSuccess();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-[18px]">
      <div className="flex flex-col gap-1 lg:gap-1.5">
        <h1 className="text-[26px] leading-[1.15] font-bold tracking-tight lg:text-[30px]">
          {title}
        </h1>
        <p className="text-sm text-zinc-600 lg:text-[15px]">{description}</p>
      </div>

      <fieldset disabled={submitting} className="flex min-w-0 flex-col gap-4 lg:gap-[18px]">
        {children}
      </fieldset>

      {serviceError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {serviceError}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        aria-busy={submitting || undefined}
        className="h-[54px] w-full gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 lg:mt-1.5"
      >
        {submitting && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
        {submitting ? submittingLabel : submitLabel}
      </Button>

      <p className="text-center text-sm text-zinc-600">{footer}</p>
    </form>
  );
}

export function AuthSwitchButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-8 font-semibold text-primary hover:underline"
    >
      {children}
    </button>
  );
}

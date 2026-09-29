import { Plus, Trash2 } from "lucide-react";
import { useRef, type ComponentProps } from "react";
import { flushSync } from "react-dom";

import { FORM_CONTROL_CLASS_NAME, FormField, getDescribedBy } from "@/components/form/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  MAX_TIERS,
  getTierFieldId,
  type EventFormErrors,
  type TierField,
  type TierFormValues,
} from "../schemas/event-form.schema";

const TIER_GRID_CLASS_NAME = "lg:grid-cols-[minmax(0,1fr)_150px_150px_44px] lg:gap-3";

const TIER_INPUTS: Record<
  TierField,
  { label: string } & Pick<ComponentProps<"input">, "placeholder" | "maxLength" | "inputMode">
> = {
  name: { label: "Nombre", placeholder: "Ej. General", maxLength: 40 },
  price: { label: "Precio (S/)", placeholder: "0", inputMode: "decimal" },
  capacity: { label: "Cantidad", placeholder: "0", inputMode: "numeric" },
};

type TierFieldsProps = {
  tiers: ReadonlyArray<TierFormValues>;
  errors: EventFormErrors["tiers"];
  canAddTier: boolean;
  canRemoveTier: boolean;
  onChange: (key: string, field: TierField, value: string) => void;
  onBlur: (key: string, field: TierField) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
};

function TierInput({
  tier,
  field,
  error,
  onChange,
  onBlur,
}: {
  tier: TierFormValues;
  field: TierField;
  error?: string;
  onChange: TierFieldsProps["onChange"];
  onBlur: TierFieldsProps["onBlur"];
}) {
  const id = getTierFieldId(tier.key, field);
  const { label, ...inputProps } = TIER_INPUTS[field];

  return (
    <FormField
      id={id}
      label={<span className="text-[13px] lg:sr-only">{label}</span>}
      error={error}
      className="gap-1.5 lg:gap-2"
    >
      <Input
        {...inputProps}
        id={id}
        type="text"
        value={tier[field]}
        onChange={(e) => onChange(tier.key, field, e.target.value)}
        onBlur={() => onBlur(tier.key, field)}
        aria-invalid={error ? true : undefined}
        aria-describedby={getDescribedBy(id, { error })}
        className={cn(FORM_CONTROL_CLASS_NAME, "min-w-0")}
      />
    </FormField>
  );
}

export function TierFields({
  tiers,
  errors,
  canAddTier,
  canRemoveTier,
  onChange,
  onBlur,
  onAdd,
  onRemove,
}: TierFieldsProps) {
  const addButtonRef = useRef<HTMLButtonElement>(null);

  function handleRemove(key: string) {
    // flushSync: con 10 tipos el botón "Agregar" sigue deshabilitado hasta el próximo render.
    flushSync(() => onRemove(key));
    addButtonRef.current?.focus();
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={cn("hidden text-[13px] font-medium text-zinc-600 lg:grid", TIER_GRID_CLASS_NAME)}
      >
        <span>{TIER_INPUTS.name.label}</span>
        <span>{TIER_INPUTS.price.label}</span>
        <span>{TIER_INPUTS.capacity.label}</span>
      </div>

      <div className="flex flex-col gap-3">
        {tiers.map((tier, index) => {
          const position = index + 1;
          const tierErrors = errors[tier.key] ?? {};
          return (
            <fieldset
              key={tier.key}
              className="relative min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
            >
              <legend className="float-left mb-3 w-full text-sm leading-6 font-semibold lg:sr-only">
                Tipo<span className="sr-only"> de entrada</span> {position}
              </legend>
              <div className={cn("clear-both flex flex-col gap-3 lg:grid lg:items-start", TIER_GRID_CLASS_NAME)}>
                <TierInput
                  tier={tier}
                  field="name"
                  error={tierErrors.name}
                  onChange={onChange}
                  onBlur={onBlur}
                />
                <div className="grid grid-cols-2 gap-3 lg:contents">
                  <TierInput
                    tier={tier}
                    field="price"
                    error={tierErrors.price}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                  <TierInput
                    tier={tier}
                    field="capacity"
                    error={tierErrors.capacity}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                </div>
                {/* En desktop el label es sr-only, pero el hueco de FormField (gap-2) se mantiene: mt-2 alinea el botón con los inputs. */}
                <button
                  type="button"
                  aria-label={`Quitar tipo de entrada ${position}`}
                  disabled={!canRemoveTier}
                  onClick={() => handleRemove(tier.key)}
                  className="absolute top-1 right-1 flex size-11 items-center justify-center rounded-xl text-zinc-600 outline-none hover:bg-zinc-100 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 lg:static lg:mt-2 lg:self-start"
                >
                  <Trash2 className="size-[18px]" aria-hidden="true" />
                </button>
              </div>
            </fieldset>
          );
        })}
      </div>

      <button
        ref={addButtonRef}
        type="button"
        disabled={!canAddTier}
        onClick={onAdd}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-indigo-300 text-sm font-semibold text-indigo-700 outline-none hover:bg-indigo-50/60 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 lg:h-11 lg:w-fit lg:rounded-xl lg:px-4"
      >
        <Plus className="size-[17px]" aria-hidden="true" />
        Agregar tipo de entrada
      </button>
      {!canAddTier && (
        <p className="text-[13px] text-zinc-600">Puedes crear hasta {MAX_TIERS} tipos de entrada.</p>
      )}
    </>
  );
}

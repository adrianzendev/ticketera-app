import { useCallback, useRef, useState } from "react";

import {
  EMPTY_EVENT_VALUES,
  MAX_TIERS,
  createEmptyTier,
  createEventFormSchema,
  getEventFormErrors,
  getFirstInvalidFieldId,
  type EventField,
  type EventFormData,
  type EventFormErrors,
  type EventFormValues,
  type TierField,
} from "../schemas/event-form.schema";

export type EventFormValidateResult =
  | { success: true; data: EventFormData }
  | { success: false; firstInvalidId: string };

type TouchedKey = EventField | `${string}.${TierField}`;

const tierTouchedKey = (key: string, field: TierField): TouchedKey => `${key}.${field}`;

function getNextTierKey(tiers: ReadonlyArray<{ key: string }>): number {
  const numericKeys = tiers.map((tier) => Number(tier.key)).filter(Number.isFinite);
  return Math.max(0, ...numericKeys) + 1;
}

function filterVisibleErrors(
  errors: EventFormErrors,
  touched: ReadonlySet<TouchedKey>,
): EventFormErrors {
  const fields: EventFormErrors["fields"] = Object.fromEntries(
    Object.entries(errors.fields).filter(([field]) => touched.has(field as EventField)),
  );
  const tiers: EventFormErrors["tiers"] = {};
  for (const [key, tierErrors] of Object.entries(errors.tiers)) {
    const visible = Object.fromEntries(
      Object.entries(tierErrors).filter(([field]) =>
        touched.has(tierTouchedKey(key, field as TierField)),
      ),
    );
    if (Object.keys(visible).length > 0) tiers[key] = visible;
  }
  return { fields, tiers };
}

export function useEventForm({
  initialValues = EMPTY_EVENT_VALUES,
  now = () => new Date(),
}: { initialValues?: EventFormValues; now?: () => Date } = {}) {
  // Una sola lectura del reloj al montar: el render queda puro y la validación es estable.
  const [nowValue] = useState(now);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<ReadonlySet<TouchedKey>>(() => new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  // addTier devuelve la key de forma síncrona, así que la lista de keys vive en un ref
  // además del estado; nextTierKey nunca retrocede para no reutilizar ids del DOM.
  const tierKeysRef = useRef(initialValues.tiers.map((tier) => tier.key));
  const nextTierKeyRef = useRef(getNextTierKey(initialValues.tiers));

  const allErrors = getEventFormErrors(values, nowValue);
  const errors = submitAttempted ? allErrors : filterVisibleErrors(allErrors, touched);

  const setField = useCallback(
    <K extends EventField | "imageUrl">(field: K, value: EventFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const markTouched = useCallback((key: TouchedKey) => {
    setTouched((current) => (current.has(key) ? current : new Set(current).add(key)));
  }, []);

  const blurField = useCallback((field: EventField) => markTouched(field), [markTouched]);

  const setTierField = useCallback((key: string, field: TierField, value: string) => {
    setValues((current) => ({
      ...current,
      tiers: current.tiers.map((tier) => (tier.key === key ? { ...tier, [field]: value } : tier)),
    }));
  }, []);

  const blurTierField = useCallback(
    (key: string, field: TierField) => markTouched(tierTouchedKey(key, field)),
    [markTouched],
  );

  const addTier = useCallback((): string | null => {
    if (tierKeysRef.current.length >= MAX_TIERS) return null;
    const key = String(nextTierKeyRef.current);
    nextTierKeyRef.current += 1;
    tierKeysRef.current = [...tierKeysRef.current, key];
    setValues((current) => ({ ...current, tiers: [...current.tiers, createEmptyTier(key)] }));
    return key;
  }, []);

  const removeTier = useCallback((key: string) => {
    const keys = tierKeysRef.current;
    if (keys.length <= 1 || !keys.includes(key)) return;
    tierKeysRef.current = keys.filter((tierKey) => tierKey !== key);
    setValues((current) => ({
      ...current,
      tiers: current.tiers.filter((tier) => tier.key !== key),
    }));
    setTouched((current) => {
      const prefix = `${key}.`;
      return new Set([...current].filter((touchedKey) => !touchedKey.startsWith(prefix)));
    });
  }, []);

  const validate = (): EventFormValidateResult => {
    setSubmitAttempted(true);
    const result = createEventFormSchema(nowValue).safeParse(values);
    if (result.success) return { success: true, data: result.data };
    // Sin error de campo ni de tier, el único origen posible es la portada (p. ej. un PNG
    // de 0 bytes produce un data URL vacío que el schema rechaza).
    return {
      success: false,
      firstInvalidId: getFirstInvalidFieldId(values, allErrors) ?? "event-image",
    };
  };

  return {
    values,
    errors,
    canAddTier: values.tiers.length < MAX_TIERS,
    canRemoveTier: values.tiers.length > 1,
    setField,
    blurField,
    setTierField,
    blurTierField,
    addTier,
    removeTier,
    validate,
  };
}

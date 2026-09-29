import { useCallback, useState } from "react";
import type { z } from "zod";

import { getFieldErrors, type FieldErrors } from "@/lib/validation";

export type ValidateResult<D, F extends string> =
  | { success: true; data: D }
  | { success: false; firstInvalidField: F };

export function useValidatedForm<V extends Record<string, unknown>, D>({
  schema,
  fields,
  initialValues,
}: {
  schema: z.ZodType<D, V>;
  fields: ReadonlyArray<keyof V & string>;
  initialValues: V;
}) {
  type F = keyof V & string;

  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<ReadonlySet<F>>(() => new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const allErrors = getFieldErrors<F>(schema, values);
  const errors: FieldErrors<F> = submitAttempted
    ? allErrors
    : (Object.fromEntries(
        Object.entries(allErrors).filter(([field]) => touched.has(field as F)),
      ) as FieldErrors<F>);

  const setField = useCallback(<K extends F>(field: K, value: V[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const blurField = useCallback((field: F) => {
    setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));
  }, []);

  const validate = (): ValidateResult<D, F> => {
    setSubmitAttempted(true);
    const firstInvalidField = fields.find((field) => allErrors[field] !== undefined);
    if (firstInvalidField) return { success: false, firstInvalidField };
    return { success: true, data: schema.parse(values) };
  };

  return { values, errors, setField, blurField, validate };
}

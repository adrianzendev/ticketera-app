import { useCallback, useState } from "react";

import {
  CHECKOUT_FIELDS,
  EMPTY_CHECKOUT_VALUES,
  checkoutSchema,
  getCheckoutErrors,
  type CheckoutData,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutFormValues,
} from "@/modules/order/schemas/checkout.schema";

type ValidateResult =
  | { success: true; data: CheckoutData }
  | { success: false; firstInvalidField: CheckoutField };

export function useCheckoutForm(initialValues: CheckoutFormValues = EMPTY_CHECKOUT_VALUES) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<ReadonlySet<CheckoutField>>(() => new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const allErrors = getCheckoutErrors(values);
  const errors: CheckoutErrors = submitAttempted
    ? allErrors
    : Object.fromEntries(
        Object.entries(allErrors).filter(([field]) => touched.has(field as CheckoutField)),
      );

  const setField = useCallback(
    <K extends CheckoutField>(field: K, value: CheckoutFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const blurField = useCallback((field: CheckoutField) => {
    setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));
  }, []);

  const validate = (): ValidateResult => {
    setSubmitAttempted(true);
    const firstInvalidField = CHECKOUT_FIELDS.find((field) => allErrors[field] !== undefined);
    if (firstInvalidField) return { success: false, firstInvalidField };
    return { success: true, data: checkoutSchema.parse(values) };
  };

  return { values, errors, setField, blurField, validate };
}

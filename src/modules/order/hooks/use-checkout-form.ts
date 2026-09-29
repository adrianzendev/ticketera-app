import { useValidatedForm } from "@/hooks/use-validated-form";
import {
  CHECKOUT_FIELDS,
  EMPTY_CHECKOUT_VALUES,
  checkoutSchema,
  type CheckoutFormValues,
} from "@/modules/order/schemas/checkout.schema";

export function useCheckoutForm(initialValues: CheckoutFormValues = EMPTY_CHECKOUT_VALUES) {
  return useValidatedForm({ schema: checkoutSchema, fields: CHECKOUT_FIELDS, initialValues });
}

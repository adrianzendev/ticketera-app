import { Smartphone, Store, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  documentTypeSchema,
  formatCardExpiry,
  formatCardNumber,
  paymentMethodSchema,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutFormValues,
  type DocumentType,
} from "@/modules/order/schemas/checkout.schema";

type CheckoutFieldsProps = {
  values: CheckoutFormValues;
  errors: CheckoutErrors;
  onFieldChange: <K extends CheckoutField>(field: K, value: CheckoutFormValues[K]) => void;
  onFieldBlur: (field: CheckoutField) => void;
};

type TextField = Exclude<CheckoutField, "documentType" | "paymentMethod" | "acceptedTerms">;

const DOCUMENT_INPUT: Record<DocumentType, { placeholder: string; inputMode: "numeric" | "text" }> = {
  DNI: { placeholder: "8 dígitos", inputMode: "numeric" },
  CE: { placeholder: "9 dígitos", inputMode: "numeric" },
  PASSPORT: { placeholder: "Número de pasaporte", inputMode: "text" },
};

const PAYMENT_NOTICES: Partial<Record<CheckoutFormValues["paymentMethod"], { icon: LucideIcon; text: string }>> = {
  yape: {
    icon: Smartphone,
    text: "Al continuar te mostraremos un código QR para pagar desde tu app de Yape.",
  },
  cash: {
    icon: Store,
    text: "Generaremos un código de pago para que pagues en agentes, bodegas o tu banca móvil.",
  },
};

const sectionClassName =
  "flex flex-col gap-4 rounded-[20px] border border-zinc-200 bg-white px-4 py-5 lg:gap-5 lg:rounded-3xl lg:p-7";
const headingClassName = "text-lg font-semibold lg:text-xl";
const labelClassName = "text-sm font-medium";
const controlClassName =
  "h-[52px] rounded-[14px] border-zinc-300 bg-white px-4 text-base md:text-base lg:text-[15px]";
const selectClassName =
  "h-[52px] w-[104px] shrink-0 rounded-[14px] border border-zinc-300 bg-white px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 lg:w-[110px] lg:text-[15px]";

const fieldId = (field: CheckoutField) => `checkout-${field}`;
const errorId = (field: CheckoutField) => `checkout-${field}-error`;

function a11yProps(field: CheckoutField, errors: CheckoutErrors) {
  const hasError = errors[field] !== undefined;
  return {
    id: fieldId(field),
    "aria-invalid": hasError || undefined,
    "aria-describedby": hasError ? errorId(field) : undefined,
  };
}

function FieldError({ field, errors }: { field: CheckoutField; errors: CheckoutErrors }) {
  const message = errors[field];
  if (!message) return null;
  return (
    <p id={errorId(field)} className="text-sm text-destructive">
      {message}
    </p>
  );
}

function TextInput({
  field,
  label,
  values,
  errors,
  onFieldChange,
  onFieldBlur,
  format,
  className,
  ...inputProps
}: CheckoutFieldsProps & {
  field: TextField;
  label: ReactNode;
  format?: (value: string) => string;
  className?: string;
} & Omit<ComponentProps<"input">, "id" | "value" | "onChange" | "onBlur" | "className">) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={fieldId(field)} className={labelClassName}>
        {label}
      </label>
      <Input
        {...inputProps}
        {...a11yProps(field, errors)}
        value={values[field]}
        onChange={(e) => onFieldChange(field, format ? format(e.target.value) : e.target.value)}
        onBlur={() => onFieldBlur(field)}
        className={controlClassName}
      />
      <FieldError field={field} errors={errors} />
    </div>
  );
}

function DocumentField(props: CheckoutFieldsProps) {
  const { values, errors, onFieldChange, onFieldBlur } = props;
  const documentInput = DOCUMENT_INPUT[values.documentType];

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className={cn(labelClassName, "mb-2")}>Documento de identidad</legend>
      <div className="flex gap-2">
        <label htmlFor={fieldId("documentType")} className="sr-only">
          Tipo de documento
        </label>
        <select
          id={fieldId("documentType")}
          value={values.documentType}
          onChange={(e) => onFieldChange("documentType", documentTypeSchema.parse(e.target.value))}
          onBlur={() => onFieldBlur("documentType")}
          className={selectClassName}
        >
          {DOCUMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={fieldId("documentNumber")} className="sr-only">
          Número de documento
        </label>
        <Input
          {...a11yProps("documentNumber", errors)}
          type="text"
          inputMode={documentInput.inputMode}
          placeholder={documentInput.placeholder}
          value={values.documentNumber}
          onChange={(e) => onFieldChange("documentNumber", e.target.value)}
          onBlur={() => onFieldBlur("documentNumber")}
          className={cn(controlClassName, "flex-1")}
        />
      </div>
      <FieldError field="documentNumber" errors={errors} />
    </fieldset>
  );
}

function PaymentMethodField({ values, onFieldChange }: CheckoutFieldsProps) {
  return (
    <fieldset
      id={fieldId("paymentMethod")}
      className="grid grid-cols-1 gap-2.5 lg:grid-cols-3 lg:gap-3"
    >
      <legend className="sr-only">Método de pago</legend>
      {PAYMENT_METHOD_OPTIONS.map((option) => (
        <label
          key={option.value}
          className="flex h-[60px] cursor-pointer items-center gap-3 rounded-[14px] border-2 border-zinc-200 bg-white px-4 text-[15px] font-semibold has-[:checked]:border-primary has-[:checked]:bg-indigo-50 has-[:disabled]:cursor-not-allowed lg:h-[76px] lg:rounded-2xl lg:px-[18px]"
        >
          <input
            type="radio"
            name="paymentMethod"
            value={option.value}
            checked={values.paymentMethod === option.value}
            onChange={(e) => onFieldChange("paymentMethod", paymentMethodSchema.parse(e.target.value))}
            className="size-5 shrink-0 accent-primary lg:size-[18px]"
          />
          <span className="lg:hidden">{option.mobileLabel}</span>
          <span className="hidden lg:inline">{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function PaymentNotice({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <p className="flex items-start gap-3 rounded-[14px] bg-indigo-50 p-4 text-sm leading-normal text-indigo-800 lg:items-center lg:gap-3.5 lg:rounded-2xl lg:px-5 lg:py-[18px] lg:text-[15px]">
      <Icon className="size-5 shrink-0 lg:size-[22px]" aria-hidden="true" />
      {text}
    </p>
  );
}

function CardFields(props: CheckoutFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-[18px]">
      <TextInput
        {...props}
        field="cardNumber"
        label="Número de tarjeta"
        type="text"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="0000 0000 0000 0000"
        format={formatCardNumber}
        className="col-span-2"
      />
      <TextInput
        {...props}
        field="cardExpiry"
        label="Vencimiento"
        type="text"
        inputMode="numeric"
        autoComplete="cc-exp"
        placeholder="MM/AA"
        format={formatCardExpiry}
      />
      <TextInput
        {...props}
        field="cardCvv"
        label="CVV"
        type="text"
        inputMode="numeric"
        autoComplete="cc-csc"
        maxLength={4}
        placeholder="3 o 4 dígitos"
        format={(value) => value.replace(/\D/g, "").slice(0, 4)}
      />
      <TextInput
        {...props}
        field="cardName"
        label="Nombre en la tarjeta"
        type="text"
        autoComplete="cc-name"
        placeholder="Como aparece en la tarjeta"
        className="col-span-2 lg:col-span-4"
      />
    </div>
  );
}

function TermsField({ values, errors, onFieldChange, onFieldBlur }: CheckoutFieldsProps) {
  return (
    <div className="flex flex-col gap-1 px-1 lg:px-0">
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2.5 text-sm leading-normal text-zinc-700 lg:items-center">
        <input
          type="checkbox"
          {...a11yProps("acceptedTerms", errors)}
          checked={values.acceptedTerms}
          onChange={(e) => onFieldChange("acceptedTerms", e.target.checked)}
          onBlur={() => onFieldBlur("acceptedTerms")}
          className="size-[22px] shrink-0 accent-primary lg:size-5"
        />
        <span>
          Acepto los{" "}
          <Link href="/terminos" className="font-medium text-primary hover:underline">
            Términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="font-medium text-primary hover:underline">
            Política de privacidad
          </Link>
          .
        </span>
      </label>
      <FieldError field="acceptedTerms" errors={errors} />
    </div>
  );
}

export function CheckoutFields(props: CheckoutFieldsProps) {
  const notice = PAYMENT_NOTICES[props.values.paymentMethod];

  return (
    <>
      <section aria-labelledby="checkout-buyer-heading" className={sectionClassName}>
        <div className="flex flex-col gap-1">
          <h2 id="checkout-buyer-heading" className={headingClassName}>
            Datos del comprador
          </h2>
          <p className="text-[13px] text-muted-foreground lg:text-sm">
            Enviaremos tus entradas al correo que indiques.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-[18px]">
          <TextInput
            {...props}
            field="fullName"
            label="Nombre completo"
            type="text"
            autoComplete="name"
            placeholder="Como figura en tu documento"
          />
          <TextInput
            {...props}
            field="email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
          />
          <DocumentField {...props} />
          <TextInput
            {...props}
            field="phone"
            label="Celular"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Número de celular"
          />
        </div>
      </section>

      <section aria-labelledby="checkout-payment-heading" className={sectionClassName}>
        <h2 id="checkout-payment-heading" className={headingClassName}>
          Método de pago
        </h2>
        <PaymentMethodField {...props} />
        {props.values.paymentMethod === "card" && <CardFields {...props} />}
        {notice && <PaymentNotice icon={notice.icon} text={notice.text} />}
      </section>

      <TermsField {...props} />
    </>
  );
}

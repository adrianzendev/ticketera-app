import Link from "next/link";

import { useValidatedForm } from "@/hooks/use-validated-form";
import {
  AuthForm,
  AuthPasswordField,
  AuthSwitchButton,
  AuthTextField,
} from "@/modules/auth/components/auth-form-field";
import {
  EMPTY_REGISTER_VALUES,
  PASSWORD_HINT,
  REGISTER_FIELDS,
  registerSchema,
} from "@/modules/auth/schemas/auth.schema";
import { useAuthStore } from "@/modules/auth/store/auth.store";

const TERMS_ID = "register-acceptedTerms";

export function RegisterForm({
  onSwitchMode,
  onSuccess,
}: {
  onSwitchMode: () => void;
  onSuccess: () => void;
}) {
  const { values, errors, setField, blurField, validate } = useValidatedForm({
    schema: registerSchema,
    fields: REGISTER_FIELDS,
    initialValues: EMPTY_REGISTER_VALUES,
  });

  return (
    <AuthForm
      idPrefix="register"
      title="Crea tu cuenta"
      description="Guarda tus entradas y recibe novedades de tus eventos."
      validate={validate}
      submit={() => useAuthStore.getState().register(values)}
      onSuccess={onSuccess}
      submitLabel="Crear cuenta"
      submittingLabel="Creando cuenta…"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <AuthSwitchButton onClick={onSwitchMode}>Inicia sesión</AuthSwitchButton>
        </>
      }
    >
      <AuthTextField
        id="register-fullName"
        label="Nombre completo"
        type="text"
        autoComplete="name"
        placeholder="Tu nombre y apellido"
        value={values.fullName}
        error={errors.fullName}
        onChange={(e) => setField("fullName", e.target.value)}
        onBlur={() => blurField("fullName")}
      />

      <AuthTextField
        id="register-email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={values.email}
        error={errors.email}
        onChange={(e) => setField("email", e.target.value)}
        onBlur={() => blurField("email")}
      />

      <AuthPasswordField
        id="register-password"
        label="Contraseña"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
        value={values.password}
        error={errors.password}
        onChange={(e) => setField("password", e.target.value)}
        onBlur={() => blurField("password")}
      />

      <div className="flex flex-col gap-1">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 py-2.5 text-sm leading-normal text-zinc-700">
          <input
            type="checkbox"
            id={TERMS_ID}
            checked={values.acceptedTerms}
            aria-invalid={errors.acceptedTerms ? true : undefined}
            aria-describedby={errors.acceptedTerms ? `${TERMS_ID}-error` : undefined}
            onChange={(e) => setField("acceptedTerms", e.target.checked)}
            onBlur={() => blurField("acceptedTerms")}
            className="size-[22px] shrink-0 accent-primary lg:size-5"
          />
          <span>
            Acepto los{" "}
            <Link href="/terminos" className="font-medium text-primary hover:underline">
              Términos y condiciones
            </Link>
          </span>
        </label>
        {errors.acceptedTerms && (
          <p id={`${TERMS_ID}-error`} className="text-sm text-destructive">
            {errors.acceptedTerms}
          </p>
        )}
      </div>
    </AuthForm>
  );
}

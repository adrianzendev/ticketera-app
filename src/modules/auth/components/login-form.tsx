import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useValidatedForm } from "@/hooks/use-validated-form";
import {
  AuthForm,
  AuthPasswordField,
  AuthSwitchButton,
  AuthTextField,
} from "@/modules/auth/components/auth-form-field";
import { DEMO_CREDENTIALS } from "@/modules/auth/data/users.mock";
import {
  EMPTY_LOGIN_VALUES,
  LOGIN_FIELDS,
  loginSchema,
} from "@/modules/auth/schemas/auth.schema";
import { useAuthStore } from "@/modules/auth/store/auth.store";

const FORGOT_PASSWORD_NOTICE = "La recuperación de contraseña estará disponible pronto.";

export function LoginForm({
  onSwitchMode,
  onSuccess,
}: {
  onSwitchMode: () => void;
  onSuccess: () => void;
}) {
  const { values, errors, setField, blurField, validate } = useValidatedForm({
    schema: loginSchema,
    fields: LOGIN_FIELDS,
    initialValues: EMPTY_LOGIN_VALUES,
  });
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  function fillDemoCredentials() {
    setField("email", DEMO_CREDENTIALS.email);
    setField("password", DEMO_CREDENTIALS.password);
  }

  return (
    <AuthForm
      idPrefix="login"
      title="Hola de nuevo"
      description="Ingresa para ver tus entradas y comprar más rápido."
      validate={validate}
      submit={() => useAuthStore.getState().login(values)}
      onSuccess={onSuccess}
      submitLabel="Iniciar sesión"
      submittingLabel="Ingresando…"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <AuthSwitchButton onClick={onSwitchMode}>Crea una gratis</AuthSwitchButton>
        </>
      }
    >
      <div className="flex flex-col gap-3 rounded-2xl bg-indigo-50 p-4 text-sm leading-normal text-indigo-900 sm:flex-row sm:items-center sm:justify-between">
        <p>
          ¿Solo quieres probar? Usa la cuenta demo:{" "}
          <strong className="font-semibold">{DEMO_CREDENTIALS.email}</strong> /{" "}
          <strong className="font-semibold">{DEMO_CREDENTIALS.password}</strong>
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={fillDemoCredentials}
          className="h-11 shrink-0 rounded-xl border-indigo-200 bg-white px-4 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 hover:text-indigo-900"
        >
          Usar cuenta demo
        </Button>
      </div>

      <AuthTextField
        id="login-email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={values.email}
        error={errors.email}
        onChange={(e) => setField("email", e.target.value)}
        onBlur={() => blurField("email")}
      />

      <div className="flex flex-col">
        <AuthPasswordField
          id="login-password"
          label="Contraseña"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={(e) => setField("password", e.target.value)}
          onBlur={() => blurField("password")}
          labelAction={
            <button
              type="button"
              onClick={() => setShowForgotNotice(true)}
              className="min-h-8 text-sm font-semibold text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          }
        />
        <p aria-live="polite" className="mt-2 text-sm text-muted-foreground empty:mt-0">
          {showForgotNotice ? FORGOT_PASSWORD_NOTICE : ""}
        </p>
      </div>
    </AuthForm>
  );
}

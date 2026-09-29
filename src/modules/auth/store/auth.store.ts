import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  sessionUserSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type SessionUser,
} from "@/modules/auth/schemas/auth.schema";
import { authService } from "@/modules/auth/services/auth.service";

export const AUTH_STORAGE_KEY = "ticketera-session";

export type AuthState = {
  user: SessionUser | null;
  login: (values: LoginFormValues) => Promise<SessionUser>;
  register: (values: RegisterFormValues) => Promise<SessionUser>;
  logout: () => void;
};

const persistedUserSchema = sessionUserSchema.nullable().catch(null);

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (values) => {
        const user = await authService.login(values);
        set({ user });
        return user;
      },
      register: async (values) => {
        const user = await authService.register(values);
        set({ user });
        return user;
      },
      logout: () => set({ user: null }),
    }),
    {
      // La sesión va en localStorage (sobrevive a cerrar la pestaña y se ve en pestañas nuevas,
      // como una sesión real); carrito y pedidos siguen en sessionStorage porque son de la
      // compra en curso. Solo se guarda { id, name, email }, nunca la contraseña.
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user }) => ({ user }),
      version: 1,
      merge: (persisted, current) => ({
        ...current,
        user: persistedUserSchema.parse((persisted as { user?: unknown } | undefined)?.user),
      }),
      // La rehidratación la dispara el cliente al montar, para no romper la hidratación SSR.
      skipHydration: true,
    },
  ),
);

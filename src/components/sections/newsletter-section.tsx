import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <div className="flex flex-col items-center gap-12 rounded-3xl bg-indigo-50 p-14 md:flex-row md:justify-between">
        <div className="flex max-w-[520px] flex-col gap-2.5">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            No te pierdas ningún evento
          </h2>
          <p className="text-base text-muted-foreground">
            Suscríbete y recibe las novedades de tus artistas y equipos favoritos.
          </p>
        </div>
        <form className="flex gap-2.5">
          <label className="flex h-14 w-[360px] items-center gap-2.5 rounded-2xl border border-indigo-200 bg-white px-[18px] text-muted-foreground">
            <Mail className="size-5 shrink-0" />
            <span className="sr-only">Correo electrónico</span>
            <Input
              type="email"
              placeholder="tu@email.com"
              className="h-auto border-0 bg-transparent p-0 text-base focus-visible:ring-0"
            />
          </label>
          <Button type="submit" size="lg" className="h-14 rounded-2xl px-[26px] text-[15px]">
            Suscribirme
          </Button>
        </form>
      </div>
    </section>
  );
}

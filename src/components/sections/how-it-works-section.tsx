import { CreditCard, Search, Ticket } from "lucide-react";

const steps = [
  {
    icon: Search,
    label: "Paso 1",
    title: "Buscar",
    description: "Encuentra el evento, artista o ciudad que te interesa.",
    showConnector: true,
  },
  {
    icon: Ticket,
    label: "Paso 2",
    title: "Elegir",
    description: "Selecciona tus entradas y la cantidad que necesitas.",
    showConnector: true,
  },
  {
    icon: CreditCard,
    label: "Paso 3",
    title: "Comprar",
    description: "Paga de forma segura y recibe tus entradas al instante.",
    showConnector: false,
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="mx-auto w-full max-w-7xl px-4 md:px-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Cómo funciona
        </h2>
        <p className="text-muted-foreground">Tres pasos y ya estás dentro.</p>
      </div>
      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <step.icon size={28} />
              </span>
              {step.showConnector ? (
                <span className="grow border-t border-dashed border-zinc-300" />
              ) : null}
            </div>
            <span className="text-xs font-semibold text-indigo-600">
              {step.label}
            </span>
            <h3 className="text-xl font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="max-w-[340px] text-[15px] text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

import { Ticket } from "lucide-react";
import Link from "next/link";

const footerColumns = [
  {
    title: "Compañía",
    links: [
      { label: "Sobre nosotros", href: "#" },
      { label: "Contacto", href: "#" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Centro de ayuda", href: "#" },
      { label: "Cómo comprar", href: "#" },
      { label: "Reembolsos", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos y condiciones", href: "#" },
      { label: "Privacidad", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
  {
    title: "Síguenos",
    links: [
      { label: "Instagram", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "X (Twitter)", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 md:px-6">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3.5 md:w-[300px] md:shrink-0">
            <span className="flex items-center gap-2.5">
              <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
                <Ticket size={18} strokeWidth={2} />
              </span>
              <span className="text-lg font-bold tracking-tight">Ticketera</span>
            </span>
            <p className="text-sm text-muted-foreground">
              Entradas para conciertos, deportes, teatro y festivales.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:gap-14">
            {footerColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border pt-6 text-[13px] text-muted-foreground">
          © {new Date().getFullYear()} Ticketera. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

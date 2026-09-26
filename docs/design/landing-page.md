# Design system — Landing page Ticketera

Modo claro únicamente. Referencia visual: Ticketmaster (estructura, jerarquía de cards) + Joinnus (color, calidez). Fuente única: Poppins.

## Color (oklch, pegar en `src/app/globals.css` `:root`)

Paleta corta: 1 primario vibrante (violeta/índigo — entretenimiento, CTAs) + 1 acento cálido (coral/naranja — badges, precio, "destacado"), neutrales grises para todo lo demás. Sin dark mode: se elimina el bloque `.dark`.

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);

  --primary: oklch(0.55 0.22 293);          /* violeta vibrante — CTAs, links activos, nav activo */
  --primary-foreground: oklch(0.985 0 0);

  --secondary: oklch(0.97 0.012 293);        /* tinte violeta muy claro — fondos de sección alternos */
  --secondary-foreground: oklch(0.32 0.08 293);

  --accent: oklch(0.74 0.18 48);             /* coral/naranja — badge "Destacado", precio, hover de card */
  --accent-foreground: oklch(0.22 0.04 48);

  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);      /* texto secundario: fecha, venue, ciudad */

  --destructive: oklch(0.577 0.245 27.325);  /* "Agotado" */
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.55 0.22 293);

  --radius: 0.75rem;
}
```

No incluir bloque `.dark` — la landing es light-only.

## Tipografía

Poppins vía `next/font/google`, variable `--font-sans` (ya configurado en `layout.tsx`). Una sola familia, se varía por peso y tamaño.

| Uso | Tamaño (Tailwind) | Peso |
|---|---|---|
| Hero title | `text-5xl md:text-6xl` | 800 (extrabold) |
| H1 (título de sección) | `text-3xl md:text-4xl` | 700 (bold) |
| H2 (subtítulo de sección) | `text-xl md:text-2xl` | 600 (semibold) |
| H3 (título de card) | `text-lg` | 600 (semibold) |
| Body | `text-base` | 400 (regular) |
| Small (fecha, venue, ciudad, meta) | `text-sm` | 500 (medium) |
| Botón / label / badge | `text-sm` | 600 (semibold) |
| Precio | `text-base` | 700 (bold), color `--accent-foreground` sobre fondo `--accent`/10 |

Line-height: `leading-tight` en hero/H1, `leading-relaxed` en body.

## Spacing y radios

- Unidad base: 4px (escala Tailwind por defecto, sin cambios).
- Padding de sección: `py-16 md:py-24`, contenedor `max-w-7xl mx-auto px-4 md:px-6`.
- Gap entre cards: `gap-4 md:gap-6`.
- Radios: `--radius: 0.75rem` → `--radius-lg` (cards, inputs), `--radius-sm`/`--radius-md` derivados ya en `@theme inline`. Cards de evento usan `rounded-lg` (imagen) + `rounded-xl` en el contenedor exterior para look más suave tipo Joinnus.

## Componentes

**Header/nav** — fondo `--background`, `border-b border-border`, sticky top-0. Logo izquierda, nav de categorías centro (oculto en mobile, via `sheet`), input de búsqueda (shadcn `input`, icono `Search` de lucide) + botón menú mobile (`sheet` + ícono `Menu`) a la derecha. Altura `h-16`.

**Hero + carrusel** — shadcn `carousel`, altura `h-[420px] md:h-[520px]`, imagen full-bleed con overlay `bg-gradient-to-t from-black/70 to-transparent`, título del evento en blanco sobre el overlay (hero title), badge de categoría (`--accent`) arriba del título, CTA "Comprar entradas" (`Button` variant default = `--primary`).

**Card de evento** — shadcn `card`, imagen `aspect-[4/3] rounded-t-lg object-cover`, badge de categoría flotante (`absolute top-2 left-2`, fondo `--accent`, texto `--accent-foreground`), título (H3) truncado a 2 líneas, fecha + venue/ciudad en `text-sm text-muted-foreground` con íconos `Calendar`/`MapPin` de lucide, precio "Desde S/ X" en la esquina inferior (bold, `--foreground`). Hover: `hover:shadow-md transition-shadow`.

**Grid de categorías** — círculos o badges grandes (`rounded-full` o `card` chico), ícono lucide por categoría + nombre, grid `grid-cols-3 md:grid-cols-6`, fondo `--secondary` en reposo, `--primary`/10 en hover.

**Botones** (shadcn `button`, variantes ya soportadas):
- `default` (primary): fondo `--primary`, texto `--primary-foreground` — CTA principal ("Comprar entradas").
- `secondary`: fondo `--secondary`, texto `--secondary-foreground` — acciones secundarias ("Ver más").
- `ghost`: transparente, texto `--foreground`, hover `--muted` — nav links, "Ver todos".

**Footer** — fondo `--secondary`, 3-4 columnas de links (`text-sm text-muted-foreground`, hover `text-foreground`), separador (`separator`) antes del copyright, copyright en `text-xs text-muted-foreground`.

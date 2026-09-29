import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { CategoryFilterChips } from "@/modules/event/components/category-filter-chips";
import { CategoryGrid } from "@/modules/event/components/category-grid";
import { FeaturedCarousel } from "@/modules/event/components/featured-carousel";
import { UpcomingEventsGrid } from "@/modules/event/components/upcoming-events-grid";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <FeaturedCarousel />

      <main className="flex flex-1 flex-col gap-16 py-8 md:gap-24 md:py-12">
        <section id="categorias" className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">
            Explora por categoría
          </h2>
          <CategoryGrid />
        </section>

        <section id="eventos" className="w-full bg-muted py-16 md:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                  Próximos eventos
                </h2>
                <p className="text-muted-foreground">
                  Ordenados por fecha. Asegura tu lugar antes de que se agoten.
                </p>
              </div>
              <Link
                href="/eventos"
                className="flex items-center gap-1.5 text-[15px] font-semibold text-primary hover:text-primary/80"
              >
                Ver calendario completo
                <ChevronRight className="size-[18px]" />
              </Link>
            </div>

            <CategoryFilterChips />

            <div className="mt-8">
              <UpcomingEventsGrid />
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <NewsletterSection />
      </main>
      <SiteFooter />
    </div>
  );
}

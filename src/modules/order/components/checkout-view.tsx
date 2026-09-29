"use client";

import { Clock, ShoppingCart, TicketX, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

import type { EventDetail } from "@/modules/event/schemas/event.schema";
import { eventService } from "@/modules/event/services/event.service";
import { CheckoutFields } from "@/modules/order/components/checkout-form";
import {
  CheckoutMobileSummary,
  CheckoutPayBar,
  CheckoutSummary,
} from "@/modules/order/components/checkout-summary";
import { PurchaseStepsHeader } from "@/modules/order/components/purchase-steps-header";
import { useCheckoutForm } from "@/modules/order/hooks/use-checkout-form";
import { useCountdown } from "@/modules/order/hooks/use-countdown";
import type { OrderLine } from "@/modules/order/schemas/order.schema";
import { getOrderLines, orderService } from "@/modules/order/services/order.service";
import {
  getCartCount,
  getCartTotal,
  useCartStore,
  type CartItems,
} from "@/modules/order/store/cart.store";
import { venueService } from "@/modules/venue/services/venue.service";

const RESERVATION_SECONDS = 600;
const LAST_MINUTE_SECONDS = 60;
const PAYMENT_ERROR = "No pudimos procesar el pago. Inténtalo de nuevo.";

type CheckoutStatus = "idle" | "submitting" | "redirecting" | "expired";

type CheckoutCart = { event: EventDetail; lines: OrderLine[]; total: number; count: number };

function getCheckoutCart(eventSlug: string | null, items: CartItems): CheckoutCart | null {
  const event = eventSlug ? eventService.getBySlug(eventSlug) : null;
  if (!event) return null;
  const lines = getOrderLines(items, event.tiers, venueService.getByEventSlug(event.slug));
  if (lines.length === 0) return null;
  return {
    event,
    lines,
    total: getCartTotal(items, event.tiers),
    count: getCartCount(items),
  };
}

const ticketsHref = (slug: string) => `/eventos/${slug}/entradas`;

const primaryLinkClassName =
  "flex min-h-11 items-center justify-center rounded-2xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90";

function StatusCard({
  icon: Icon,
  title,
  text,
  linkHref,
  linkLabel,
  focusOnMount = false,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  linkHref: string;
  linkLabel: string;
  focusOnMount?: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <main className="flex flex-1 flex-col p-4 lg:px-20 lg:py-14">
      <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-[20px] border border-zinc-200 bg-white p-6 text-center lg:rounded-3xl lg:p-10">
        <span className="flex size-14 items-center justify-center rounded-full bg-indigo-50 text-primary">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h1
          ref={headingRef}
          tabIndex={focusOnMount ? -1 : undefined}
          className="text-xl font-bold tracking-tight outline-none lg:text-2xl"
        >
          {title}
        </h1>
        <p className="text-[15px] text-muted-foreground">{text}</p>
        <Link href={linkHref} className={primaryLinkClassName}>
          {linkLabel}
        </Link>
      </section>
    </main>
  );
}

function ReservationNotice({ formatted, secondsLeft }: { formatted: string; secondsLeft: number }) {
  return (
    <div className="px-4 pt-4 lg:px-20 lg:pt-6">
      <p className="flex items-start gap-2.5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-sm leading-[1.45] text-orange-800 lg:min-h-14 lg:items-center lg:gap-3 lg:px-5 lg:py-3 lg:text-[15px]">
        <Clock className="mt-px size-[18px] shrink-0 lg:mt-0 lg:size-5" aria-hidden="true" />
        <span>
          Reservamos tus entradas por{" "}
          <strong role="timer" className="tabular-nums">
            {formatted}
          </strong>
          . Completa el pago antes de que se liberen.
        </span>
      </p>
      {/* El timer no se anuncia cada segundo; solo se avisa una vez al entrar al último minuto. */}
      <p aria-live="polite" className="sr-only">
        {secondsLeft <= LAST_MINUTE_SECONDS ? "Queda menos de 1 minuto para completar el pago." : ""}
      </p>
    </div>
  );
}

function CheckoutContent({
  cart,
  status,
  onStatusChange,
}: {
  cart: CheckoutCart;
  status: CheckoutStatus;
  onStatusChange: (status: CheckoutStatus) => void;
}) {
  const router = useRouter();
  const { values, errors, setField, blurField, validate } = useCheckoutForm();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { event, lines, total, count } = cart;
  const changeHref = ticketsHref(event.slug);

  const { formatted, secondsLeft } = useCountdown({
    durationSeconds: RESERVATION_SECONDS,
    onExpire: () => {
      if (status !== "idle") return;
      useCartStore.getState().clear();
      onStatusChange("expired");
    },
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle") return;
    setPaymentError(null);

    // flushSync para que aria-invalid y los mensajes ya estén en el DOM cuando el lector anuncie el foco.
    let result!: ReturnType<typeof validate>;
    flushSync(() => {
      result = validate();
    });
    if (!result.success) {
      document.getElementById(`checkout-${result.firstInvalidField}`)?.focus();
      return;
    }

    onStatusChange("submitting");
    try {
      const order = await orderService.create({ event, values });
      onStatusChange("redirecting");
      router.replace(`/checkout/confirmacion/${order.id}`);
    } catch {
      onStatusChange("idle");
      setPaymentError(PAYMENT_ERROR);
    }
  }

  const busy = status !== "idle";

  return (
    <main className="flex flex-1 flex-col pb-36 lg:pb-0">
      <h1 className="sr-only">Datos y pago</h1>
      <ReservationNotice formatted={formatted} secondsLeft={secondsLeft} />

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 lg:px-20 lg:pt-6 lg:pb-20"
      >
        <CheckoutMobileSummary
          event={event}
          lines={lines}
          total={total}
          count={count}
          changeHref={changeHref}
        />

        <fieldset disabled={busy} className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <CheckoutFields
            values={values}
            errors={errors}
            onFieldChange={setField}
            onFieldBlur={blurField}
          />
        </fieldset>

        <CheckoutSummary
          event={event}
          lines={lines}
          total={total}
          acceptedTerms={values.acceptedTerms}
          submitting={busy}
          changeHref={changeHref}
          paymentError={paymentError}
        />

        <CheckoutPayBar
          total={total}
          acceptedTerms={values.acceptedTerms}
          submitting={busy}
          paymentError={paymentError}
        />
      </form>
    </main>
  );
}

export function CheckoutView() {
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [submittedCart, setSubmittedCart] = useState<CheckoutCart | null>(null);
  const eventSlug = useCartStore((s) => s.eventSlug);
  const standing = useCartStore((s) => s.standing);
  const seated = useCartStore((s) => s.seated);

  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  const liveCart = hydrated ? getCheckoutCart(eventSlug, { standing, seated }) : null;
  // Tras pagar, el service vacía el carrito: se congela el que se envió para no mostrar S/ 0
  // ni el estado vacío mientras se navega a la confirmación.
  const cart = status === "submitting" || status === "redirecting" ? submittedCart : liveCart;

  function changeStatus(next: CheckoutStatus) {
    if (next === "submitting") setSubmittedCart(liveCart);
    setStatus(next);
  }

  if (!hydrated) {
    return (
      <>
        <PurchaseStepsHeader currentStep={2} backHref="/eventos" backLabel="Volver a eventos" />
        <main aria-busy="true" className="flex flex-1 flex-col">
          <span className="sr-only">Cargando tu compra…</span>
        </main>
      </>
    );
  }

  if (status === "expired") {
    const href = eventSlug ? ticketsHref(eventSlug) : "/eventos";
    return (
      <>
        <PurchaseStepsHeader currentStep={2} backHref={href} backLabel="Volver a entradas" />
        <StatusCard
          icon={TicketX}
          title="Tu reserva expiró"
          text="Pasaron 10 minutos y liberamos tus entradas. Vuelve a elegirlas para continuar."
          linkHref={href}
          linkLabel="Elegir entradas de nuevo"
          focusOnMount
        />
      </>
    );
  }

  if (!cart) {
    return (
      <>
        <PurchaseStepsHeader currentStep={2} backHref="/eventos" backLabel="Volver a eventos" />
        <StatusCard
          icon={ShoppingCart}
          title="No tienes entradas en tu carrito"
          text="Elige un evento y tus entradas para continuar con la compra."
          linkHref="/eventos"
          linkLabel="Explorar eventos"
        />
      </>
    );
  }

  return (
    <>
      <PurchaseStepsHeader
        currentStep={2}
        backHref={ticketsHref(cart.event.slug)}
        backLabel="Volver a entradas"
      />
      <CheckoutContent cart={cart} status={status} onStatusChange={changeStatus} />
    </>
  );
}

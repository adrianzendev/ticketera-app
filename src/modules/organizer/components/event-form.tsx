"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";

import { FORM_CONTROL_CLASS_NAME, FormField, getDescribedBy } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { categories } from "@/modules/event/data/categories.mock";

import { useEventForm, type EventFormValidateResult } from "../hooks/use-event-form";
import {
  DESCRIPTION_MAX_LENGTH,
  EVENT_NAME_MAX_LENGTH,
  getEventFieldId,
  getTierFieldId,
  type EventField,
} from "../schemas/event-form.schema";
import type { OrganizerEventStatus } from "../schemas/organizer-event.schema";
import { buildOrganizerEvent, getEventFormPreview } from "../services/event-form.service";
import { formatTicketTotal } from "../services/organizer.service";
import { useOrganizerEventStore } from "../store/organizer-event.store";
import { CoverImageField } from "./cover-image-field";
import { EventPreviewCard } from "./event-preview-card";
import { ORGANIZER_EVENTS_HREF, ORGANIZER_HOME_HREF } from "./organizer-shell";
import { TierFields } from "./tier-fields";

const NATIVE_CONTROL_CLASS_NAME = cn(
  FORM_CONTROL_CLASS_NAME,
  "w-full min-w-0 border outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
);

const SAVING_LABELS: Record<OrganizerEventStatus, string> = {
  draft: "Guardando…",
  published: "Publicando…",
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-zinc-200 bg-white px-4 py-5 lg:gap-[18px] lg:rounded-[22px] lg:p-7"
    >
      <div className="flex flex-col gap-1">
        <h2 id={titleId} className="text-[17px] font-semibold lg:text-lg">
          {title}
        </h2>
        {description && <p className="text-[13px] text-zinc-600 lg:text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function EventForm() {
  const router = useRouter();
  const {
    values,
    errors,
    canAddTier,
    canRemoveTier,
    setField,
    blurField,
    setTierField,
    blurTierField,
    addTier,
    removeTier,
    validate,
  } = useEventForm();
  const [saving, setSaving] = useState<OrganizerEventStatus | null>(null);
  const preview = getEventFormPreview(values);

  // Rehidratar antes de guardar evita que addEvent pise los eventos ya creados en la pestaña.
  useEffect(() => {
    void useOrganizerEventStore.persist.rehydrate();
  }, []);

  function controlProps(field: EventField) {
    const id = getEventFieldId(field);
    const error = errors.fields[field];
    return {
      id,
      value: values[field],
      onBlur: () => blurField(field),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": getDescribedBy(id, { error }),
    };
  }

  function fieldFrameProps(field: EventField) {
    return { id: getEventFieldId(field), error: errors.fields[field] };
  }

  function save(status: OrganizerEventStatus) {
    if (saving) return;

    // flushSync para que aria-invalid y los mensajes ya estén en el DOM cuando el lector anuncie el foco.
    let result!: EventFormValidateResult;
    flushSync(() => {
      result = validate();
    });
    if (!result.success) {
      document.getElementById(result.firstInvalidId)?.focus();
      return;
    }

    setSaving(status);
    const event = buildOrganizerEvent(result.data, status);
    useOrganizerEventStore.getState().addEvent(event);
    router.push(`${ORGANIZER_HOME_HREF}?creado=${encodeURIComponent(event.id)}`);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    save("published");
  }

  function handleAddTier() {
    const key = flushSync(() => addTier());
    if (key) document.getElementById(getTierFieldId(key, "name"))?.focus();
  }

  return (
    <div className="px-4 pt-4 pb-28 lg:px-12 lg:pt-8 lg:pb-12">
      <div className="mb-6 hidden flex-col gap-2.5 lg:flex">
        <Link
          href={ORGANIZER_EVENTS_HREF}
          className="flex h-8 w-fit items-center gap-1.5 rounded-lg text-sm font-medium text-zinc-600 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Mis eventos
        </Link>
        <h1 className="text-[32px] leading-[1.15] font-bold tracking-tight">Crear evento</h1>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8"
      >
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <FormSection title="Información básica">
            <FormField label="Nombre del evento" {...fieldFrameProps("name")}>
              <Input
                {...controlProps("name")}
                onChange={(e) => setField("name", e.target.value)}
                maxLength={EVENT_NAME_MAX_LENGTH}
                placeholder="Ej. Festival de verano 2026"
                className={FORM_CONTROL_CLASS_NAME}
              />
            </FormField>
            <FormField label="Categoría" {...fieldFrameProps("categorySlug")}>
              <select
                {...controlProps("categorySlug")}
                onChange={(e) => setField("categorySlug", e.target.value)}
                className={NATIVE_CONTROL_CLASS_NAME}
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Descripción" {...fieldFrameProps("description")}>
              <textarea
                {...controlProps("description")}
                onChange={(e) => setField("description", e.target.value)}
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="Cuenta de qué trata el evento, quiénes se presentan y qué incluye la entrada."
                className={cn(
                  NATIVE_CONTROL_CLASS_NAME,
                  "h-[120px] resize-y py-3.5 leading-normal placeholder:text-muted-foreground",
                )}
              />
            </FormField>
          </FormSection>

          <FormSection title="Fecha y lugar">
            <div className="grid grid-cols-2 gap-3 lg:gap-x-5 lg:gap-y-[18px]">
              <FormField label="Fecha" {...fieldFrameProps("date")}>
                <Input
                  {...controlProps("date")}
                  type="date"
                  onChange={(e) => setField("date", e.target.value)}
                  className={cn(FORM_CONTROL_CLASS_NAME, "min-w-0")}
                />
              </FormField>
              <FormField label="Hora de inicio" {...fieldFrameProps("time")}>
                <Input
                  {...controlProps("time")}
                  type="time"
                  onChange={(e) => setField("time", e.target.value)}
                  className={cn(FORM_CONTROL_CLASS_NAME, "min-w-0")}
                />
              </FormField>
              <FormField
                label="Lugar"
                className="col-span-2 lg:col-span-1"
                {...fieldFrameProps("venueName")}
              >
                <Input
                  {...controlProps("venueName")}
                  onChange={(e) => setField("venueName", e.target.value)}
                  maxLength={80}
                  placeholder="Ej. Estadio Nacional"
                  className={FORM_CONTROL_CLASS_NAME}
                />
              </FormField>
              <FormField
                label="Ciudad"
                className="col-span-2 lg:col-span-1"
                {...fieldFrameProps("city")}
              >
                <Input
                  {...controlProps("city")}
                  onChange={(e) => setField("city", e.target.value)}
                  maxLength={60}
                  placeholder="Ej. Lima"
                  className={FORM_CONTROL_CLASS_NAME}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Imagen de portada">
            <CoverImageField
              value={values.imageUrl}
              onChange={(dataUrl) => setField("imageUrl", dataUrl)}
            />
          </FormSection>

          <FormSection
            title="Tipos de entrada"
            description="Cada tipo tiene su precio y su cantidad disponible."
          >
            <TierFields
              tiers={values.tiers}
              errors={errors.tiers}
              canAddTier={canAddTier}
              canRemoveTier={canRemoveTier}
              onChange={setTierField}
              onBlur={blurTierField}
              onAdd={handleAddTier}
              onRemove={removeTier}
            />
            <p className="flex justify-between gap-3 border-t border-zinc-100 pt-3 text-sm text-zinc-600 lg:pt-3.5">
              <span>Capacidad total</span>
              <strong className="font-semibold text-foreground tabular-nums">
                {formatTicketTotal(preview.capacity)}
              </strong>
            </p>
          </FormSection>

          <div className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-2 gap-2.5 border-t border-zinc-200 bg-white px-4 pt-3 pb-5 shadow-[0_-12px_24px_-18px_rgba(24,24,27,0.35)] lg:static lg:flex lg:justify-end lg:gap-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <Button
              type="button"
              variant="outline"
              disabled={saving !== null}
              aria-busy={saving === "draft" || undefined}
              onClick={() => save("draft")}
              className="h-[52px] gap-2 rounded-[14px] border-[1.5px] border-zinc-300 bg-white text-[15px] font-semibold lg:px-[22px]"
            >
              {saving === "draft" && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
              {saving === "draft" ? SAVING_LABELS.draft : "Guardar borrador"}
            </Button>
            <Button
              type="submit"
              disabled={saving !== null}
              aria-busy={saving === "published" || undefined}
              className="h-[52px] gap-2 rounded-[14px] bg-primary text-[15px] font-semibold text-primary-foreground hover:bg-primary/90 lg:px-6"
            >
              {saving === "published" && (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              )}
              {saving === "published" ? (
                SAVING_LABELS.published
              ) : (
                <span>
                  Publicar<span className="hidden lg:inline"> evento</span>
                </span>
              )}
            </Button>
          </div>
        </div>

        <aside aria-label="Vista previa" className="flex min-w-0 flex-col gap-2.5 lg:sticky lg:top-8 lg:gap-3">
          <span className="text-xs font-semibold tracking-[0.06em] text-zinc-600 uppercase lg:text-[13px]">
            Vista previa
          </span>
          <EventPreviewCard preview={preview} imageUrl={values.imageUrl} />
        </aside>
      </form>
    </div>
  );
}

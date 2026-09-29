"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { flushSync } from "react-dom";

import { getDescribedBy } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getCoverImageError, readFileAsDataUrl } from "../services/event-form.service";
import { OrganizerEventImage } from "./organizer-event-image";

const INPUT_ID = "event-image";
const HINT = "JPG o PNG, horizontal (16:9). Máximo 1 MB.";
const READ_ERROR = "No pudimos leer la imagen. Prueba con otra.";

const actionButtonClassName =
  "h-11 gap-2 rounded-xl border-[1.5px] border-zinc-300 bg-white px-4 text-sm font-semibold";

export function CoverImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const fileError = getCoverImageError(file);
    if (fileError) {
      setError(fileError);
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setError(null);
      onChange(dataUrl);
    } catch {
      setError(READ_ERROR);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Limpiar el valor permite volver a elegir el mismo archivo y recibir otro change.
    e.target.value = "";
    void handleFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    // dragleave también se dispara al pasar sobre los hijos de la zona.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  }

  function handleRemove() {
    // El botón desaparece al quitar la imagen: el foco pasa a la zona de carga.
    flushSync(() => {
      setError(null);
      onChange(null);
    });
    inputRef.current?.focus();
  }

  const input = (
    <input
      ref={inputRef}
      id={INPUT_ID}
      type="file"
      accept="image/png,image/jpeg"
      className="sr-only"
      tabIndex={value ? -1 : undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={getDescribedBy(INPUT_ID, {
        hint: value ? undefined : HINT,
        error: error ?? undefined,
      })}
      onChange={handleInputChange}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="flex flex-col gap-3">
          <OrganizerEventImage
            src={value}
            sizes="(min-width: 1024px) 600px, 100vw"
            className="aspect-video rounded-2xl"
          />
          <div className="grid grid-cols-2 gap-2.5 lg:flex lg:gap-3">
            <Button
              type="button"
              variant="outline"
              className={actionButtonClassName}
              onClick={() => inputRef.current?.click()}
            >
              Cambiar imagen
            </Button>
            <Button
              type="button"
              variant="outline"
              className={actionButtonClassName}
              onClick={handleRemove}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Quitar imagen
            </Button>
          </div>
          {input}
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-indigo-300 bg-indigo-50/60 px-4 text-center text-indigo-800 focus-within:ring-3 focus-within:ring-ring/50 lg:h-[180px] lg:rounded-[18px]",
            dragging && "border-primary",
          )}
        >
          {input}
          <ImagePlus className="size-7" aria-hidden="true" />
          <span className="text-[15px] font-semibold">
            <span className="lg:hidden">Subir imagen</span>
            <span className="hidden lg:inline">Arrastra una imagen o haz clic para subirla</span>
          </span>
          <span id={`${INPUT_ID}-hint`} className="block text-xs text-zinc-600 lg:text-[13px]">
            {HINT}
          </span>
        </label>
      )}
      {error && (
        <p id={`${INPUT_ID}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

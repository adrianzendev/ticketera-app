"use client";

import { useState, type ReactNode } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_SCALE = 1;
// Tolerancia para comparar la escala: las animaciones de zoom terminan con decimales.
const SCALE_EPSILON = 0.01;

type ZoomableCanvasProps = {
  label: string;
  children: ReactNode;
  maxScale?: number;
  className?: string;
};

const FULL_WIDTH = { width: "100%" } as const;

export function ZoomableCanvas({ label, children, maxScale = 4, className }: ZoomableCanvasProps) {
  const [scale, setScale] = useState(MIN_SCALE);
  const isZoomed = scale > MIN_SCALE + SCALE_EPSILON;
  const isAtMax = scale >= maxScale - SCALE_EPSILON;

  return (
    <div
      role="region"
      aria-label={label}
      className={cn("relative overflow-hidden rounded-2xl bg-zinc-50", className)}
    >
      <TransformWrapper
        minScale={MIN_SCALE}
        maxScale={maxScale}
        wheel={{ disabled: true }}
        pinch={{ disabled: false }}
        // Sin pan a escala 1: en mobile el arrastre con un dedo debe hacer scroll de la página.
        panning={{ disabled: !isZoomed }}
        // El doble toque haría zoom a la vez que selecciona una zona o asiento.
        doubleClick={{ disabled: true }}
        onTransform={(_, state) => setScale(state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent wrapperStyle={FULL_WIDTH} contentStyle={FULL_WIDTH}>
              {children}
            </TransformComponent>
            {/* En mobile los controles van debajo del mapa para no tapar zonas; en desktop, flotantes. */}
            <div className="flex justify-end gap-2 p-2 lg:absolute lg:top-3 lg:right-3 lg:flex-col lg:p-0">
              <Button
                type="button"
                variant="outline"
                aria-label="Acercar"
                className="size-11 lg:size-10"
                disabled={isAtMax}
                onClick={() => zoomIn()}
              >
                <Plus aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                aria-label="Alejar"
                className="size-11 lg:size-10"
                disabled={!isZoomed}
                onClick={() => zoomOut()}
              >
                <Minus aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                aria-label="Restablecer zoom"
                className="size-11 lg:size-10"
                disabled={!isZoomed}
                onClick={() => resetTransform()}
              >
                <RotateCcw aria-hidden="true" />
              </Button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

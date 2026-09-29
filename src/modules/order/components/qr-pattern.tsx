import { cn } from "@/lib/utils";

export const QR_SIZE = 21;

const FINDER_SIZE = 7;
const FINDER_ORIGINS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, QR_SIZE - FINDER_SIZE],
  [QR_SIZE - FINDER_SIZE, 0],
];

// Devuelve null si la celda no pertenece a una marca de esquina ni a su separador.
function getFinderCell(row: number, col: number): boolean | null {
  for (const [originRow, originCol] of FINDER_ORIGINS) {
    const dr = row - originRow;
    const dc = col - originCol;
    if (dr < -1 || dr > FINDER_SIZE || dc < -1 || dc > FINDER_SIZE) continue;
    const inside = dr >= 0 && dr < FINDER_SIZE && dc >= 0 && dc < FINDER_SIZE;
    const ring = dr === 0 || dr === FINDER_SIZE - 1 || dc === 0 || dc === FINDER_SIZE - 1;
    const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
    return inside && (ring || core);
  }
  return null;
}

export function buildQrMatrix(seed: number): boolean[][] {
  let x = seed;
  const random = () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };

  return Array.from({ length: QR_SIZE }, (_, row) =>
    Array.from({ length: QR_SIZE }, (_, col) => getFinderCell(row, col) ?? random() > 0.52),
  );
}

export function QrPattern({ seed, className }: { seed: number; className?: string }) {
  const d = buildQrMatrix(seed)
    .flatMap((cells, row) => cells.map((dark, col) => (dark ? `M${col} ${row}h1v1h-1z` : "")))
    .join("");

  return (
    <svg
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
      className={cn("block", className)}
    >
      <rect width={QR_SIZE} height={QR_SIZE} fill="#ffffff" />
      <path d={d} fill="#18181B" />
    </svg>
  );
}

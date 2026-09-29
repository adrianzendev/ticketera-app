import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { buildQrMatrix, QR_SIZE, QrPattern } from "./qr-pattern";

describe("buildQrMatrix", () => {
  it("AC-12: devuelve una matriz de 21×21", () => {
    const matrix = buildQrMatrix(24817);
    expect(QR_SIZE).toBe(21);
    expect(matrix).toHaveLength(21);
    for (const row of matrix) expect(row).toHaveLength(21);
  });

  it("AC-12: es determinista y cambia con el seed", () => {
    expect(buildQrMatrix(24817)).toEqual(buildQrMatrix(24817));
    expect(buildQrMatrix(24817)).not.toEqual(buildQrMatrix(10000));
  });

  it("AC-12: dibuja las 3 marcas de esquina con borde, anillo claro y núcleo", () => {
    const matrix = buildQrMatrix(12345);
    for (const [r0, c0] of [
      [0, 0],
      [0, 14],
      [14, 0],
    ]) {
      for (let i = 0; i < 7; i++) {
        expect(matrix[r0][c0 + i]).toBe(true);
        expect(matrix[r0 + 6][c0 + i]).toBe(true);
        expect(matrix[r0 + i][c0]).toBe(true);
        expect(matrix[r0 + i][c0 + 6]).toBe(true);
      }
      for (let i = 1; i < 6; i++) {
        expect(matrix[r0 + 1][c0 + i]).toBe(false);
        expect(matrix[r0 + 5][c0 + i]).toBe(false);
        expect(matrix[r0 + i][c0 + 1]).toBe(false);
        expect(matrix[r0 + i][c0 + 5]).toBe(false);
      }
      for (let r = 2; r <= 4; r++) {
        for (let c = 2; c <= 4; c++) expect(matrix[r0 + r][c0 + c]).toBe(true);
      }
    }
    expect(matrix[0].slice(0, 7).every(Boolean)).toBe(true);
    expect(matrix[3][3]).toBe(true);
    expect(matrix[1][1]).toBe(false);
  });

  it("AC-12: el separador alrededor de cada marca es claro", () => {
    const matrix = buildQrMatrix(24817);
    for (let i = 0; i <= 7; i++) {
      expect(matrix[7][i]).toBe(false);
      expect(matrix[i][7]).toBe(false);
      expect(matrix[7][13 + i]).toBe(false);
      expect(matrix[i][13]).toBe(false);
      expect(matrix[13][i]).toBe(false);
      expect(matrix[13 + i][7]).toBe(false);
    }
  });

  it("AC-12: llena el resto con el generador del diseño", () => {
    const seed = 24817;
    let x = seed;
    const matrix = buildQrMatrix(seed);
    const isFinderArea = (r: number, c: number) =>
      (r <= 7 && c <= 7) || (r <= 7 && c >= 13) || (r >= 13 && c <= 7);
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        if (isFinderArea(r, c)) continue;
        x = (x * 9301 + 49297) % 233280;
        expect(matrix[r][c]).toBe(x / 233280 > 0.52);
      }
    }
  });
});

describe("QrPattern", () => {
  it("AC-12: renderiza un svg aria-hidden con un solo path oscuro", () => {
    const { container } = render(createElement(QrPattern, { seed: 24817 }));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 21 21");
    expect(svg?.getAttribute("shape-rendering")).toBe("crispEdges");
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    expect(paths[0].getAttribute("fill")).toBe("#18181B");
  });
});

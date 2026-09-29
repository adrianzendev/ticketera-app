const DARK_TEXT = "#18181B";
const LIGHT_TEXT = "#FFFFFF";

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(value.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function getContrastTextColor(hex: string): typeof DARK_TEXT | typeof LIGHT_TEXT {
  const background = relativeLuminance(hex);
  const withDark = contrastRatio(background, relativeLuminance(DARK_TEXT));
  const withLight = contrastRatio(background, relativeLuminance(LIGHT_TEXT));
  return withDark >= withLight ? DARK_TEXT : LIGHT_TEXT;
}

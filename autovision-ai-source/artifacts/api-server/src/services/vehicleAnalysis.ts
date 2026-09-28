import sharp from "sharp";

export type ColourEstimate = {
  name: string;
  hex: string;
};

const colourBands: Array<{ name: string; hex: string; matches: (r: number, g: number, b: number) => boolean }> = [
  { name: "Black", hex: "#111827", matches: (r, g, b) => Math.max(r, g, b) < 55 },
  { name: "White", hex: "#F8FAFC", matches: (r, g, b) => Math.min(r, g, b) > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 28 },
  { name: "Silver", hex: "#94A3B8", matches: (r, g, b) => Math.min(r, g, b) > 105 && Math.max(r, g, b) - Math.min(r, g, b) < 35 },
  { name: "Red", hex: "#DC2626", matches: (r, g, b) => r > g * 1.35 && r > b * 1.35 },
  { name: "Blue", hex: "#2563EB", matches: (r, g, b) => b > r * 1.28 && b > g * 1.08 },
  { name: "Green", hex: "#16A34A", matches: (r, g, b) => g > r * 1.2 && g > b * 1.08 },
  { name: "Yellow", hex: "#EAB308", matches: (r, g, b) => r > 150 && g > 125 && b < 100 },
  { name: "Brown", hex: "#92400E", matches: (r, g, b) => r > b * 1.4 && g < r * 0.82 && r > 70 },
];

export async function inspectImage(buffer: Buffer): Promise<{
  width: number;
  height: number;
  colour: ColourEstimate;
}> {
  const { data, info } = await sharp(buffer)
    .resize({ width: 48, height: 48, fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let red = 0;
  let green = 0;
  let blue = 0;
  const pixelCount = Math.max(1, info.width * info.height);

  for (let index = 0; index < data.length; index += info.channels) {
    red += data[index] ?? 0;
    green += data[index + 1] ?? 0;
    blue += data[index + 2] ?? 0;
  }

  const average = {
    r: Math.round(red / pixelCount),
    g: Math.round(green / pixelCount),
    b: Math.round(blue / pixelCount),
  };
  const band = colourBands.find(({ matches }) => matches(average.r, average.g, average.b));

  return {
    width: info.width,
    height: info.height,
    colour: band ?? { name: "Grey", hex: "#64748B" },
  };
}
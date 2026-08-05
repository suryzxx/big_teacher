const lexileArPairs = [
  { lexile: 650, ar: 2.9 },
  { lexile: 690, ar: 3.1 },
  { lexile: 720, ar: 3.4 },
  { lexile: 760, ar: 3.6 },
  { lexile: 800, ar: 4.1 },
  { lexile: 840, ar: 4.5 },
  { lexile: 880, ar: 4.8 },
  { lexile: 930, ar: 5.1 },
  { lexile: 980, ar: 5.6 },
];

export const lexileRange = {
  min: lexileArPairs[0].lexile,
  max: lexileArPairs[lexileArPairs.length - 1].lexile,
};

export const arRange = {
  min: lexileArPairs[0].ar,
  max: lexileArPairs[lexileArPairs.length - 1].ar,
};

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function convertLexileToAr(lexile: number) {
  const clampedLexile = clampNumber(lexile, lexileArPairs[0].lexile, lexileArPairs[lexileArPairs.length - 1].lexile);
  const upperIndex = lexileArPairs.findIndex((pair) => pair.lexile >= clampedLexile);
  if (upperIndex <= 0) return lexileArPairs[0].ar;

  const lower = lexileArPairs[upperIndex - 1];
  const upper = lexileArPairs[upperIndex];
  const ratio = (clampedLexile - lower.lexile) / (upper.lexile - lower.lexile);
  return Number((lower.ar + (upper.ar - lower.ar) * ratio).toFixed(1));
}

export function convertArToLexile(ar: number) {
  const clampedAr = clampNumber(ar, lexileArPairs[0].ar, lexileArPairs[lexileArPairs.length - 1].ar);
  const upperIndex = lexileArPairs.findIndex((pair) => pair.ar >= clampedAr);
  if (upperIndex <= 0) return lexileArPairs[0].lexile;

  const lower = lexileArPairs[upperIndex - 1];
  const upper = lexileArPairs[upperIndex];
  const ratio = (clampedAr - lower.ar) / (upper.ar - lower.ar);
  return roundToStep(lower.lexile + (upper.lexile - lower.lexile) * ratio, 10);
}

export function normalizeLexileInput(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return roundToStep(clampNumber(parsed, lexileRange.min, lexileRange.max), 10);
}

export function normalizeArInput(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Number(clampNumber(parsed, arRange.min, arRange.max).toFixed(1));
}

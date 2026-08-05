import type { ResourceType } from "@/types";

export const typeOptions: ResourceType[] = ["Writing", "Podcast", "Video", "Reading"];

export const LEXILE_MIN = 0;
export const LEXILE_MAX = 1200;
export const LEXILE_STEP = 10;
export const WORDS_MIN = 0;
export const WORDS_MAX = 3000;
export const WORDS_STEP = 100;
export const DURATION_MIN = 0;
export const DURATION_MAX = 60;
export const DURATION_STEP = 1;

export function formatWords(value: number) {
  return `${Number.isInteger(value / 1000) ? value / 1000 : (value / 1000).toFixed(1)}k`;
}

export function formatDuration(value: number) {
  return `${value} min`;
}

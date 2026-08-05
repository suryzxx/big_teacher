import type { Resource, ResourceGenre, ResourceType } from "@/types";

export const LEXILE_MIN = 400;
export const LEXILE_MAX = 900;
export const LEXILE_STEP = 10;
export const WORDS_MIN = 1000;
export const WORDS_MAX = 2500;
export const WORDS_STEP = 100;
export const DURATION_MIN = 5;
export const DURATION_MAX = 15;
export const DURATION_STEP = 1;
export const LIBRARY_PAGE_SIZE = 15;

export const libraryGenreOptions: Array<ResourceGenre | "All"> = [
  "All",
  "Fiction",
  "Short Story",
  "Informational Text",
  "Biography",
  "Opinion",
  "Science Fiction",
  "News",
  "Fantasy",
];

export const typeOptions: ResourceType[] = ["Writing", "Podcast", "Video", "Reading"];

export type LibraryFilterState = {
  query: string;
  type: ResourceType | null;
  selectedGenres: string[];
  selectedTopics: string[];
  minLexile: number;
  maxLexile: number;
  minWords: number;
  maxWords: number;
  minDuration: number;
  maxDuration: number;
};

export function formatWords(value: number) {
  return `${Number.isInteger(value / 1000) ? value / 1000 : (value / 1000).toFixed(1)}k`;
}

export function formatDuration(value: number) {
  return `${value} min`;
}

export function getDurationMinutes(duration: string) {
  return Number.parseInt(duration, 10);
}

export function filterLibraryResources(resources: Resource[], filters: LibraryFilterState) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const shouldFilterLexile = filters.type === "Reading" || filters.type === "Podcast" || filters.type === "Video";

  return resources.filter((resource) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [resource.title, resource.topic, resource.genre, resource.type, ...resource.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesWords =
      filters.type !== "Reading"
        ? true
        : "wordCount" in resource && resource.wordCount >= filters.minWords && resource.wordCount <= filters.maxWords;
    const matchesDuration =
      filters.type !== "Podcast" && filters.type !== "Video"
        ? true
        : "duration" in resource &&
          getDurationMinutes(resource.duration) >= filters.minDuration &&
          getDurationMinutes(resource.duration) <= filters.maxDuration;
    const matchesLexile = shouldFilterLexile ? resource.lexile >= filters.minLexile && resource.lexile <= filters.maxLexile : true;
    const matchesGenre = filters.selectedGenres.includes("All") || filters.selectedGenres.includes(resource.genre);
    const matchesTopic = filters.selectedTopics.includes("All") || filters.selectedTopics.includes(resource.topic);

    return (
      matchesQuery &&
      (filters.type === null || resource.type === filters.type) &&
      matchesGenre &&
      matchesTopic &&
      matchesLexile &&
      matchesWords &&
      matchesDuration
    );
  });
}

export function getLibraryPagination({
  filteredResources,
  type,
  currentPage,
}: {
  filteredResources: Resource[];
  type: ResourceType | null;
  currentPage: number;
}) {
  const showCreateWritingCard = type === "Writing" && currentPage === 1;
  const totalItemCount = filteredResources.length + (type === "Writing" ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(totalItemCount / LIBRARY_PAGE_SIZE));
  const resourcePageSize = showCreateWritingCard ? LIBRARY_PAGE_SIZE - 1 : LIBRARY_PAGE_SIZE;
  const resourceStartIndex =
    type === "Writing"
      ? currentPage === 1
        ? 0
        : (currentPage - 1) * LIBRARY_PAGE_SIZE - 1
      : (currentPage - 1) * LIBRARY_PAGE_SIZE;
  const pagedResources = filteredResources.slice(resourceStartIndex, resourceStartIndex + resourcePageSize);
  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return {
    showCreateWritingCard,
    totalItemCount,
    totalPages,
    pagedResources,
    visiblePageNumbers,
  };
}

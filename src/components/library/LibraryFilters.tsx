import { type CSSProperties } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/shared/MultiSelect";
import type { ResourceType } from "@/types";
import { TypeFilterIcon } from "@/components/shared/TypeFilterIcon";
import {
  DURATION_MAX,
  DURATION_MIN,
  DURATION_STEP,
  LEXILE_MAX,
  LEXILE_MIN,
  LEXILE_STEP,
  WORDS_MAX,
  WORDS_MIN,
  WORDS_STEP,
  formatDuration,
  formatWords,
  typeOptions,
} from "./libraryUtils";

function RangeSlider({
  min,
  max,
  step,
  minValue,
  maxValue,
  minLabel,
  maxLabel,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  step: number;
  minValue: number;
  maxValue: number;
  minLabel: string;
  maxLabel: string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="lexile-range-filter">
      <div className="lexile-range-header">
        <span>
          {minLabel}～{maxLabel}
        </span>
      </div>
      <div
        className="lexile-range-control"
        style={{
          "--range-start": `${minPercent}%`,
          "--range-end": `${maxPercent}%`,
        } as CSSProperties}
      >
        <div className="lexile-range-track" aria-hidden="true">
          <span />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          aria-label="Minimum range"
          onChange={(event) => onMinChange(Math.min(Number(event.target.value), maxValue))}
        />
        <input
          className="range-max"
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          aria-label="Maximum range"
          onChange={(event) => onMaxChange(Math.max(Number(event.target.value), minValue))}
        />
      </div>
    </div>
  );
}

export function LibraryFilters({
  query,
  type,
  selectedGenres,
  selectedTopics,
  genreOpen,
  topicOpen,
  topicOptions,
  minLexile,
  maxLexile,
  minWords,
  maxWords,
  minDuration,
  maxDuration,
  onQueryChange,
  onSearchSubmit,
  onTypeChange,
  genreOptions,
  onGenresChange,
  onTopicsChange,
  onGenreOpenChange,
  onTopicOpenChange,
  onMinLexileChange,
  onMaxLexileChange,
  onMinWordsChange,
  onMaxWordsChange,
  onMinDurationChange,
  onMaxDurationChange,
}: {
  query: string;
  type: ResourceType | null;
  selectedGenres: string[];
  selectedTopics: string[];
  genreOpen: boolean;
  topicOpen: boolean;
  topicOptions: string[];
  minLexile: number;
  maxLexile: number;
  minWords: number;
  maxWords: number;
  minDuration: number;
  maxDuration: number;
  onQueryChange: (query: string) => void;
  onSearchSubmit: () => void;
  onTypeChange: (type: ResourceType | null) => void;
  genreOptions: string[];
  onGenresChange: (genres: string[]) => void;
  onTopicsChange: (topics: string[]) => void;
  onGenreOpenChange: (open: boolean) => void;
  onTopicOpenChange: (open: boolean) => void;
  onMinLexileChange: (value: number) => void;
  onMaxLexileChange: (value: number) => void;
  onMinWordsChange: (value: number) => void;
  onMaxWordsChange: (value: number) => void;
  onMinDurationChange: (value: number) => void;
  onMaxDurationChange: (value: number) => void;
}) {
  return (
    <aside className="library-filter-sidebar" aria-label="Library filters">
      <form
        className="search-filter"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
      >
        <button type="submit" className="search-filter-icon" aria-label="Search">
          <Search className="size-4" />
        </button>
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search resources"
        />
      </form>

      <div className="type-card-grid" aria-label="Type filter">
        {typeOptions.map((item) => (
          <Button
            key={item}
            type="button"
            variant={type === item ? "secondary" : "outline"}
            className="type-filter-card"
            data-type={item}
            aria-pressed={type === item}
            onClick={() => onTypeChange(type === item ? null : item)}
          >
            <TypeFilterIcon type={item} />
            <span>{item}</span>
          </Button>
        ))}
      </div>

      {(type === "Reading" || type === "Podcast" || type === "Video") && (
        <Card>
          <CardContent className="range-filter-stack pt-4">
            <RangeSlider
              min={LEXILE_MIN}
              max={LEXILE_MAX}
              step={LEXILE_STEP}
              minValue={minLexile}
              maxValue={maxLexile}
              minLabel={`Lexile: ${minLexile}`}
              maxLabel={`${maxLexile}L`}
              onMinChange={onMinLexileChange}
              onMaxChange={onMaxLexileChange}
            />
            {type === "Reading" && (
              <RangeSlider
                min={WORDS_MIN}
                max={WORDS_MAX}
                step={WORDS_STEP}
                minValue={minWords}
                maxValue={maxWords}
                minLabel={`Words: ${formatWords(minWords)}`}
                maxLabel={`${formatWords(maxWords)} words`}
                onMinChange={onMinWordsChange}
                onMaxChange={onMaxWordsChange}
              />
            )}
            {(type === "Podcast" || type === "Video") && (
              <RangeSlider
                min={DURATION_MIN}
                max={DURATION_MAX}
                step={DURATION_STEP}
                minValue={minDuration}
                maxValue={maxDuration}
                minLabel={`Duration: ${minDuration}`}
                maxLabel={formatDuration(maxDuration)}
                onMinChange={onMinDurationChange}
                onMaxChange={onMaxDurationChange}
              />
            )}
          </CardContent>
        </Card>
      )}

      {type !== "Writing" && (
        <Card className="library-filter-select-card">
          <CardContent className="library-filter-select-stack">
            <MultiSelect
              label="Genre"
              options={genreOptions}
              values={selectedGenres}
              open={genreOpen}
              required={false}
              onOpenChange={(nextOpen) => {
                onGenreOpenChange(nextOpen);
                if (nextOpen) onTopicOpenChange(false);
              }}
              onChange={onGenresChange}
            />
            <MultiSelect
              label="Topic"
              options={topicOptions}
              values={selectedTopics}
              open={topicOpen}
              required={false}
              onOpenChange={(nextOpen) => {
                onTopicOpenChange(nextOpen);
                if (nextOpen) onGenreOpenChange(false);
              }}
              onChange={onTopicsChange}
            />
          </CardContent>
        </Card>
      )}
    </aside>
  );
}

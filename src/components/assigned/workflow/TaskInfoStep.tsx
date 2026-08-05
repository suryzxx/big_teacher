import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { TypeFilterIcon } from "@/components/shared/TypeFilterIcon";

export type AssignContentType = "Reading" | "Video" | "Podcast";

export const assignContentOptions: Array<{ type: AssignContentType; label: string }> = [
  { type: "Reading", label: "Reading" },
  { type: "Video", label: "Video" },
  { type: "Podcast", label: "Podcast" },
];

export const assignGenreOptions = [
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

export const assignTopicOptions = ["All", "Science", "Chinese Arts", "Amphibians", "Social Studies"];

export function TaskInfoStep({
  taskCounts,
  onToggleContentType,
  onChangeTaskCount,
  keyword,
  onKeywordChange,
  selectedGenres,
  onGenresChange,
  genreOpen,
  onGenreOpenChange,
  selectedTopics,
  onTopicsChange,
  topicOpen,
  onTopicOpenChange,
}: {
  taskCounts: Record<AssignContentType, number>;
  onToggleContentType: (type: AssignContentType) => void;
  onChangeTaskCount: (type: AssignContentType, delta: number) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  selectedGenres: string[];
  onGenresChange: (values: string[]) => void;
  genreOpen: boolean;
  onGenreOpenChange: (open: boolean) => void;
  selectedTopics: string[];
  onTopicsChange: (values: string[]) => void;
  topicOpen: boolean;
  onTopicOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="assign-step-panel assign-task-info">
      <div className="assign-field-head">
        <strong>Content type</strong>
        <span>Supports multiple selection</span>
      </div>
      <div className="assign-content-type-list">
        {assignContentOptions.map((item) => {
          const count = taskCounts[item.type];
          return (
            <div
              key={item.type}
              className="assign-content-type-row"
              data-enabled={count > 0}
              data-type={item.type}
              role="button"
              tabIndex={0}
              onClick={() => onToggleContentType(item.type)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggleContentType(item.type);
                }
              }}
            >
              <TypeFilterIcon type={item.type} />
              <span>{item.label}</span>
              <div className="assign-content-count" aria-label={`${item.label} quantity`}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChangeTaskCount(item.type, -1);
                  }}
                >
                  -
                </Button>
                <strong>{count}</strong>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChangeTaskCount(item.type, 1);
                  }}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="assign-filter-grid">
        <MultiSelect
          label="Genre"
          helper="Supports multiple selection"
          options={assignGenreOptions}
          values={selectedGenres}
          open={genreOpen}
          onOpenChange={(nextOpen) => {
            onGenreOpenChange(nextOpen);
            if (nextOpen) onTopicOpenChange(false);
          }}
          onChange={onGenresChange}
        />
        <MultiSelect
          label="Topic"
          options={assignTopicOptions}
          values={selectedTopics}
          open={topicOpen}
          onOpenChange={(nextOpen) => {
            onTopicOpenChange(nextOpen);
            if (nextOpen) onGenreOpenChange(false);
          }}
          onChange={onTopicsChange}
        />
        <label>
          <span>Key Words</span>
          <Input value={keyword} onChange={(event) => onKeywordChange(event.target.value)} placeholder="Enter keywords" />
        </label>
      </div>
    </div>
  );
}

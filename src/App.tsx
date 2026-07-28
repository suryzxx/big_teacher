import { useMemo, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  AudioLines,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardPlus,
  FileText,
  LibraryBig,
  ListChecks,
  MessageCircle,
  MessageSquareText,
  Mic,
  MonitorPlay,
  Search,
  Send,
  SlidersHorizontal,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classes, resources } from "./data/mockData";
import type { ClassRoom, Resource, ResourceGenre, ResourceType, Student } from "./types";

const resourceIcons: Record<ResourceType, typeof BookOpen> = {
  "E-book": BookOpen,
  Audio: AudioLines,
  Video: MonitorPlay,
  Reading: FileText,
};

const riskCopy = {
  Low: "Stable",
  Medium: "Watch",
  High: "Intervene",
};

type ClassMetricKey = "lexile" | "time" | "words";
type PeriodKey = "week" | "month" | "ytd";

const classMetricOptions: Array<{ key: ClassMetricKey; label: string }> = [
  { key: "lexile", label: "Lexile Level" },
  { key: "time", label: "Study Time" },
  { key: "words", label: "Word Count" },
];

const periodOptions: Array<{ key: PeriodKey; label: string }> = [
  { key: "week", label: "By Week" },
  { key: "month", label: "By Month" },
  { key: "ytd", label: "YTD" },
];

const genreOptions: Array<ResourceGenre | "All"> = [
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

const typeOptions: ResourceType[] = ["E-book", "Audio", "Video", "Reading"];

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getStudentWords(student: Student) {
  return Math.round(student.weeklyMinutes * student.readingLevel * (student.completionRate / 100) * 0.42);
}

function getClassMetricValue(student: Student, metric: ClassMetricKey) {
  if (metric === "lexile") return student.readingLevel;
  if (metric === "time") return student.weeklyMinutes;
  return getStudentWords(student);
}

function formatClassMetricValue(value: number, metric: ClassMetricKey) {
  if (metric === "lexile") return `${value}L`;
  if (metric === "time") return `${value} min`;
  return `${value.toLocaleString()} words`;
}

function AppMetric({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof UsersRound;
}) {
  return (
    <Card size="sm" className="min-h-32 flex-row items-center gap-4 px-5">
      <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={19} />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium text-muted-foreground">{label}</p>
        <strong className="mb-1 block text-3xl leading-none font-semibold tracking-tight">{value}</strong>
        <span className="text-sm text-muted-foreground">{helper}</span>
      </div>
    </Card>
  );
}

const LEXILE_MIN = 400;
const LEXILE_MAX = 900;
const LEXILE_STEP = 10;
const WORDS_MIN = 1000;
const WORDS_MAX = 2500;
const WORDS_STEP = 100;
const DURATION_MIN = 5;
const DURATION_MAX = 15;
const DURATION_STEP = 1;

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
        <strong>
          {minLabel}～{maxLabel}
        </strong>
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

function formatWords(value: number) {
  return `${Number.isInteger(value / 1000) ? value / 1000 : (value / 1000).toFixed(1)}k`;
}

function formatDuration(value: number) {
  return `${value} min`;
}

function getDurationMinutes(duration: string) {
  return Number.parseInt(duration, 10);
}

function PreviewIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M21.25 9.14993C18.94 5.51993 15.56 3.42993 12 3.42993C10.22 3.42993 8.49 3.94993 6.91 4.91993C5.33 5.89993 3.91 7.32993 2.75 9.14993C1.75 10.7199 1.75 13.2699 2.75 14.8399C5.06 18.4799 8.44 20.5599 12 20.5599C13.78 20.5599 15.51 20.0399 17.09 19.0699C18.67 18.0899 20.09 16.6599 21.25 14.8399C22.25 13.2799 22.25 10.7199 21.25 9.14993ZM12 16.0399C9.76 16.0399 7.96 14.2299 7.96 11.9999C7.96 9.76993 9.76 7.95993 12 7.95993C14.24 7.95993 16.04 9.76993 16.04 11.9999C16.04 14.2299 14.24 16.0399 12 16.0399Z"
        fill="currentColor"
      />
      <path
        d="M11.9999 9.13989C10.4299 9.13989 9.1499 10.4199 9.1499 11.9999C9.1499 13.5699 10.4299 14.8499 11.9999 14.8499C13.5699 14.8499 14.8599 13.5699 14.8599 11.9999C14.8599 10.4299 13.5699 9.13989 11.9999 9.13989Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AssignIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M17.08 14.15C14.29 12.29 9.73996 12.29 6.92996 14.15C5.65996 15 4.95996 16.15 4.95996 17.38C4.95996 18.61 5.65996 19.75 6.91996 20.59C8.31996 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TypeFilterIcon({ type }: { type: ResourceType }) {
  if (type === "Audio") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM6.75 14.14C6.75 14.55 6.41 14.89 6 14.89C5.59 14.89 5.25 14.55 5.25 14.14V9.86C5.25 9.45 5.59 9.11 6 9.11C6.41 9.11 6.75 9.45 6.75 9.86V14.14ZM9.75 15.57C9.75 15.98 9.41 16.32 9 16.32C8.59 16.32 8.25 15.98 8.25 15.57V8.43C8.25 8.02 8.59 7.68 9 7.68C9.41 7.68 9.75 8.02 9.75 8.43V15.57ZM12.75 17C12.75 17.41 12.41 17.75 12 17.75C11.59 17.75 11.25 17.41 11.25 17V7C11.25 6.59 11.59 6.25 12 6.25C12.41 6.25 12.75 6.59 12.75 7V17ZM15.75 15.57C15.75 15.98 15.41 16.32 15 16.32C14.59 16.32 14.25 15.98 14.25 15.57V8.43C14.25 8.02 14.59 7.68 15 7.68C15.41 7.68 15.75 8.02 15.75 8.43V15.57ZM18.75 14.14C18.75 14.55 18.41 14.89 18 14.89C17.59 14.89 17.25 14.55 17.25 14.14V9.86C17.25 9.45 17.59 9.11 18 9.11C18.41 9.11 18.75 9.45 18.75 9.86V14.14Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "Video") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM14.66 13.73L13.38 14.47L12.1 15.21C10.45 16.16 9.1 15.38 9.1 13.48V12V10.52C9.1 8.61 10.45 7.84 12.1 8.79L13.38 9.53L14.66 10.27C16.31 11.22 16.31 12.78 14.66 13.73Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (type === "Reading") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM11.5 17.25C11.5 17.61 11.14 17.85 10.81 17.71C9.6 17.19 8.02 16.71 6.92 16.57L6.73 16.55C6.12 16.47 5.62 15.9 5.62 15.28V7.58C5.62 6.81 6.24 6.24 7 6.3C8.25 6.4 10.1 7 11.26 7.66C11.42 7.75 11.5 7.92 11.5 8.09V17.25ZM18.38 15.27C18.38 15.89 17.88 16.46 17.27 16.54L17.06 16.56C15.97 16.71 14.4 17.18 13.19 17.69C12.86 17.83 12.5 17.59 12.5 17.23V8.08C12.5 7.9 12.59 7.73 12.75 7.64C13.91 6.99 15.72 6.41 16.95 6.3H16.99C17.76 6.3 18.38 6.92 18.38 7.69V15.27Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM17 15.71C17 17.28 16.14 17.65 15.1 16.53C14.62 16.02 13.88 16.06 13.46 16.62L12.87 17.41C12.4 18.04 11.62 18.04 11.15 17.41L10.55 16.61C10.13 16.05 9.39 16.01 8.91 16.52C7.86 17.64 7 17.27 7 15.71V9.08C7 6.71 7.56 6.12 9.78 6.12H14.22C16.44 6.12 17 6.71 17 9.08V15.71Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ResourceCard({ resource, onAssign }: { resource: Resource; onAssign: (resource: Resource) => void }) {
  const isTextResource = "wordCount" in resource;
  const detail = isTextResource
    ? `${resource.wordCount.toLocaleString()} words`
    : resource.duration;

  return (
    <Card className="resource-card gap-0 overflow-hidden py-0">
      <div className="resource-cover">
        <img src={resource.coverImage} alt={`${resource.title} cover`} />
        <Badge variant="secondary" className="resource-genre-badge">
          {resource.genre}
        </Badge>
      </div>
      <CardHeader className="resource-card-header">
        <CardTitle className="resource-card-title">{resource.title}</CardTitle>
      </CardHeader>
      <CardContent className="resource-card-meta">
        {[`${resource.lexile}L`, detail, resource.type].map((label) => (
          <Badge key={label} variant="secondary" className="resource-card-badge">
            {label}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="resource-card-actions">
        <button type="button" className="resource-action resource-action-preview">
          <PreviewIcon />
          <span>Preview</span>
        </button>
        <button type="button" className="resource-action resource-action-assign" onClick={() => onAssign(resource)}>
          <AssignIcon />
          <span>Assign</span>
        </button>
      </CardFooter>
    </Card>
  );
}

function AssignResourceDialog({
  resource,
  selectedClassId,
  selectedStudentIds,
  onClassChange,
  onStudentToggle,
  onClose,
  onAssign,
}: {
  resource: Resource;
  selectedClassId: string;
  selectedStudentIds: string[];
  onClassChange: (classId: string) => void;
  onStudentToggle: (studentId: string) => void;
  onClose: () => void;
  onAssign: () => void;
}) {
  const selectedClass = classes.find((classRoom) => classRoom.id === selectedClassId) ?? classes[0];

  return (
    <div className="assign-backdrop" role="dialog" aria-modal="true" aria-label={`Assign ${resource.title}`}>
      <Card className="assign-dialog">
        <CardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div>
            <CardDescription>Assign resource</CardDescription>
            <CardTitle>{resource.title}</CardTitle>
          </div>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close assign dialog" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="assign-dialog-content">
          <section className="assign-section">
            <div>
              <h3>Class</h3>
              <p>Choose one class for this assignment.</p>
            </div>
            <Select value={selectedClassId} onValueChange={(nextValue) => nextValue && onClassChange(nextValue)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classRoom) => (
                  <SelectItem key={classRoom.id} value={classRoom.id}>
                    {classRoom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="assign-section">
            <div>
              <h3>Students</h3>
              <p>Select one or more students in {selectedClass.name}.</p>
            </div>
            <div className="assign-student-grid">
              {selectedClass.students.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <Button
                    key={student.id}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    className="assign-student-card"
                    aria-pressed={isSelected}
                    onClick={() => onStudentToggle(student.id)}
                  >
                    <span className="avatar" style={{ backgroundColor: student.avatarColor }}>
                      {student.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span>
                      <strong>{student.name}</strong>
                      <small>{student.readingLevel}L</small>
                    </span>
                  </Button>
                );
              })}
            </div>
          </section>
        </CardContent>

        <CardFooter className="assign-dialog-footer">
          <Badge variant="secondary">{selectedStudentIds.length} selected</Badge>
          <div>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={selectedStudentIds.length === 0} onClick={onAssign}>
              Assign
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function LibraryView() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | null>(null);
  const [genre, setGenre] = useState("All");
  const [minLexile, setMinLexile] = useState(LEXILE_MIN);
  const [maxLexile, setMaxLexile] = useState(LEXILE_MAX);
  const [minWords, setMinWords] = useState(WORDS_MIN);
  const [maxWords, setMaxWords] = useState(WORDS_MAX);
  const [minDuration, setMinDuration] = useState(DURATION_MIN);
  const [maxDuration, setMaxDuration] = useState(DURATION_MAX);
  const [assignResource, setAssignResource] = useState<Resource | null>(null);
  const [assignClassId, setAssignClassId] = useState(classes[0].id);
  const [assignStudentIds, setAssignStudentIds] = useState<string[]>([]);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState("");

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [resource.title, resource.topic, resource.genre, resource.type, ...resource.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesWords =
        type !== "E-book" && type !== "Reading" ? true : "wordCount" in resource && resource.wordCount >= minWords && resource.wordCount <= maxWords;
      const matchesDuration =
        type !== "Audio" && type !== "Video"
          ? true
          : "duration" in resource &&
            getDurationMinutes(resource.duration) >= minDuration &&
            getDurationMinutes(resource.duration) <= maxDuration;

      return (
        matchesQuery &&
        (type === null || resource.type === type) &&
        (genre === "All" || resource.genre === genre) &&
        resource.lexile >= minLexile &&
        resource.lexile <= maxLexile &&
        matchesWords &&
        matchesDuration
      );
    });
  }, [genre, maxDuration, maxLexile, maxWords, minDuration, minLexile, minWords, query, type]);

  function openAssignDialog(resource: Resource) {
    setAssignResource(resource);
    setAssignClassId(classes[0].id);
    setAssignStudentIds([]);
    setAssignSuccessMessage("");
  }

  function changeAssignClass(classId: string) {
    setAssignClassId(classId);
    setAssignStudentIds([]);
  }

  function toggleAssignStudent(studentId: string) {
    setAssignStudentIds((currentIds) =>
      currentIds.includes(studentId)
        ? currentIds.filter((id) => id !== studentId)
        : [...currentIds, studentId],
    );
  }

  function confirmAssign() {
    if (!assignResource || assignStudentIds.length === 0) return;

    const className = classes.find((classRoom) => classRoom.id === assignClassId)?.name ?? "class";
    setAssignSuccessMessage(
      `Assign successful: ${assignResource.title} assigned to ${assignStudentIds.length} student${
        assignStudentIds.length > 1 ? "s" : ""
      } in ${className}.`,
    );
    setAssignResource(null);
    setAssignStudentIds([]);
  }

  return (
    <main className="workspace library-workspace">
      {assignSuccessMessage && (
        <Card className="assign-success" role="status">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <span>{assignSuccessMessage}</span>
            <Button variant="ghost" size="sm" onClick={() => setAssignSuccessMessage("")}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {assignResource && (
        <AssignResourceDialog
          resource={assignResource}
          selectedClassId={assignClassId}
          selectedStudentIds={assignStudentIds}
          onClassChange={changeAssignClass}
          onStudentToggle={toggleAssignStudent}
          onClose={() => setAssignResource(null)}
          onAssign={confirmAssign}
        />
      )}

      <section className="library-layout">
        <aside className="library-filter-sidebar" aria-label="Library filters">
          <label className="search-filter">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search resources"
            />
          </label>

          <div className="type-card-grid" aria-label="Type filter">
            {typeOptions.map((item) => (
              <Button
                key={item}
                type="button"
                variant={type === item ? "secondary" : "outline"}
                className="type-filter-card"
                data-type={item}
                aria-pressed={type === item}
                onClick={() => setType(type === item ? null : item)}
              >
                <TypeFilterIcon type={item} />
                <span>{item}</span>
              </Button>
            ))}
          </div>

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
                onMinChange={setMinLexile}
                onMaxChange={setMaxLexile}
              />
              {(type === "E-book" || type === "Reading") && (
                <RangeSlider
                  min={WORDS_MIN}
                  max={WORDS_MAX}
                  step={WORDS_STEP}
                  minValue={minWords}
                  maxValue={maxWords}
                  minLabel={`Words: ${formatWords(minWords)}`}
                  maxLabel={`${formatWords(maxWords)} words`}
                  onMinChange={setMinWords}
                  onMaxChange={setMaxWords}
                />
              )}
              {(type === "Audio" || type === "Video") && (
                <RangeSlider
                  min={DURATION_MIN}
                  max={DURATION_MAX}
                  step={DURATION_STEP}
                  minValue={minDuration}
                  maxValue={maxDuration}
                  minLabel={`Duration: ${minDuration}`}
                  maxLabel={formatDuration(maxDuration)}
                  onMinChange={setMinDuration}
                  onMaxChange={setMaxDuration}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="genre-list">
              {genreOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="genre-filter-item"
                  data-active={genre === item}
                  onClick={() => setGenre(item)}
                >
                  {item}
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="library-main">
          <section className="resource-grid">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onAssign={openAssignDialog} />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function TaskStatusPill({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={`status status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
      {status}
    </Badge>
  );
}

function ClassPerformanceCard({
  students,
  metric,
  onMetricChange,
}: {
  students: Student[];
  metric: ClassMetricKey;
  onMetricChange: (metric: ClassMetricKey) => void;
}) {
  const values = students.map((student) => getClassMetricValue(student, metric));
  const maxValue = Math.max(...values, 1);

  return (
    <Card className="class-performance-card">
      <CardHeader>
        <div>
          <CardDescription>Class performance</CardDescription>
          <CardTitle>{classMetricOptions.find((item) => item.key === metric)?.label}</CardTitle>
        </div>
        <CardAction>
          <div className="metric-tabs" aria-label="Metric view">
            {classMetricOptions.map((item) => (
              <Button
                key={item.key}
                type="button"
                variant={metric === item.key ? "default" : "ghost"}
                size="sm"
                onClick={() => onMetricChange(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="student-bar-list">
        {students.map((student) => {
          const value = getClassMetricValue(student, metric);
          return (
            <div className="student-bar-row" key={student.id}>
              <span>{student.name}</span>
              <div className="student-bar-track">
                <i style={{ width: `${Math.max(6, (value / maxValue) * 100)}%` }} />
              </div>
              <strong>{formatClassMetricValue(value, metric)}</strong>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function FeedbackDialog({
  student,
  task,
  onClose,
}: {
  student: Student;
  task: Student["tasks"][number];
  onClose: () => void;
}) {
  return (
    <div className="feedback-backdrop" role="dialog" aria-modal="true" aria-label={`Feedback to ${student.name}`}>
      <Card className="feedback-dialog">
        <CardHeader>
          <div>
            <CardDescription>Feedback to {student.name}</CardDescription>
            <CardTitle>{task.title}</CardTitle>
          </div>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close feedback" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="feedback-dialog-grid">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardDescription>Quiz review</CardDescription>
              <CardTitle>Main idea check</CardTitle>
            </CardHeader>
            <CardContent className="quiz-review">
              {["A", "B", "C", "D"].map((option) => (
                <div className={option === "C" ? "quiz-option is-correct" : "quiz-option"} key={option}>
                  <strong>{option}</strong>
                  <span>
                    {option === "C"
                      ? "Best answer: identifies the central idea and supporting details."
                      : "Distractor answer: review evidence before selecting."}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardDescription>Teacher feedback</CardDescription>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent className="feedback-compose">
              <p className="teacher-note">
                Nice progress on this task. Focus next on explaining the evidence behind your answer in one complete sentence.
              </p>
              <textarea placeholder="Enter feedback..." />
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" size="icon">
                <Mic size={18} />
              </Button>
              <Button>
                <Send size={18} />
                Send to Student
              </Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentRow({
  student,
  isSelected,
  onSelect,
}: {
  student: Student;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const activeTask = student.tasks.find((task) => task.status === "Needs help") ?? student.tasks[0];

  return (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className="student-row"
      data-active={isSelected}
      onClick={onSelect}
    >
      <div className="student-name">
        <span className="avatar" style={{ backgroundColor: student.avatarColor }}>
          {student.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </span>
        <div>
          <strong>{student.name}</strong>
          <span>{student.readingLevel}L reading level</span>
        </div>
      </div>
      <div className="progress-cell">
        <span>{student.completionRate}% complete</span>
        <div className="progress-track">
          <i style={{ width: `${student.completionRate}%` }} />
        </div>
      </div>
      <Badge variant="secondary" className={`risk risk-${student.risk.toLowerCase()}`}>
        {riskCopy[student.risk]}
      </Badge>
      <span className="hide-mobile">{activeTask.title}</span>
    </Button>
  );
}

type StudentDirectoryStatus = "ok" | "watch" | "support";

type StudentDirectoryEntry = {
  id: string;
  name: string;
  className: "G4-A" | "G4-B" | "G5-A" | "G5-B";
  avatarColor: string;
  lexile: number;
  ar: number;
  zpd: string;
  activeTasks: number;
  lastActive: string;
  status: StudentDirectoryStatus;
};

const classScopeOptions = ["All Classes", "G4-A", "G4-B", "G5-A", "G5-B"];
const studentStatusOptions = ["All", "Active", "Needs support"];

const studentDirectory: StudentDirectoryEntry[] = [
  {
    id: "STU-10031",
    name: "Aaliyah Johnson",
    className: "G4-A",
    avatarColor: "#a56a42",
    lexile: 930,
    ar: 5.1,
    zpd: "4.5-5.8",
    activeTasks: 3,
    lastActive: "2h ago",
    status: "ok",
  },
  {
    id: "STU-10022",
    name: "Ethan Kim",
    className: "G4-B",
    avatarColor: "#8a6040",
    lexile: 880,
    ar: 4.7,
    zpd: "4.1-5.3",
    activeTasks: 2,
    lastActive: "1h ago",
    status: "ok",
  },
  {
    id: "STU-10023",
    name: "Mia Rodriguez",
    className: "G4-A",
    avatarColor: "#b66b52",
    lexile: 810,
    ar: 4.2,
    zpd: "3.7-4.8",
    activeTasks: 1,
    lastActive: "3h ago",
    status: "watch",
  },
  {
    id: "STU-10024",
    name: "Liam Chen",
    className: "G4-B",
    avatarColor: "#9b6b4c",
    lexile: 760,
    ar: 3.6,
    zpd: "3.1-4.2",
    activeTasks: 0,
    lastActive: "5h ago",
    status: "ok",
  },
  {
    id: "STU-10025",
    name: "Sophia Patel",
    className: "G5-A",
    avatarColor: "#8c5b42",
    lexile: 710,
    ar: 3.2,
    zpd: "2.7-3.8",
    activeTasks: 2,
    lastActive: "1h ago",
    status: "ok",
  },
  {
    id: "STU-10026",
    name: "Noah Thompson",
    className: "G5-B",
    avatarColor: "#7b543d",
    lexile: 980,
    ar: 5.6,
    zpd: "5.0-6.2",
    activeTasks: 1,
    lastActive: "2h ago",
    status: "watch",
  },
  {
    id: "STU-10027",
    name: "Isabella Garcia",
    className: "G5-A",
    avatarColor: "#b27354",
    lexile: 840,
    ar: 4.5,
    zpd: "3.9-5.1",
    activeTasks: 3,
    lastActive: "30m ago",
    status: "ok",
  },
  {
    id: "STU-10028",
    name: "James Wilson",
    className: "G5-B",
    avatarColor: "#6f4f3a",
    lexile: 690,
    ar: 3.1,
    zpd: "2.6-3.6",
    activeTasks: 0,
    lastActive: "1d ago",
    status: "support",
  },
  {
    id: "STU-10029",
    name: "Olivia Martinez",
    className: "G4-A",
    avatarColor: "#9a5c3d",
    lexile: 900,
    ar: 4.9,
    zpd: "4.3-5.5",
    activeTasks: 2,
    lastActive: "2h ago",
    status: "ok",
  },
  {
    id: "STU-10030",
    name: "Benjamin Moore",
    className: "G4-B",
    avatarColor: "#a77955",
    lexile: 770,
    ar: 3.8,
    zpd: "3.2-4.4",
    activeTasks: 0,
    lastActive: "6h ago",
    status: "ok",
  },
  {
    id: "STU-10032",
    name: "Chloe Anderson",
    className: "G5-A",
    avatarColor: "#a76549",
    lexile: 860,
    ar: 4.6,
    zpd: "4.0-5.2",
    activeTasks: 1,
    lastActive: "1h ago",
    status: "ok",
  },
  {
    id: "STU-10033",
    name: "William Taylor",
    className: "G5-B",
    avatarColor: "#7d5a43",
    lexile: 650,
    ar: 2.9,
    zpd: "2.4-3.4",
    activeTasks: 0,
    lastActive: "2d ago",
    status: "support",
  },
];

function StudentOverviewCard({
  tone,
  title,
  primary,
  secondary,
}: {
  tone: "green" | "purple" | "amber" | "pink";
  title: string;
  primary: string;
  secondary: string;
}) {
  return (
    <Card className="student-overview-card" data-tone={tone}>
      <CardContent>
        <span className="student-overview-mark" aria-hidden="true" />
        <div>
          <p>{title}</p>
          <strong>{primary}</strong>
          <span>{secondary}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentDirectoryCard({ student }: { student: StudentDirectoryEntry }) {
  const statusLabel =
    student.status === "support"
      ? "Needs support"
      : student.activeTasks === 0
        ? "No active tasks"
        : `${student.activeTasks} active task${student.activeTasks > 1 ? "s" : ""}`;

  return (
    <Card className="student-directory-card">
      <CardContent>
        <div className="student-card-top">
          <span className="student-photo-placeholder" style={{ backgroundColor: student.avatarColor }}>
            {student.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </span>
          <div>
            <h3>{student.name}</h3>
            <p>{student.id}</p>
          </div>
          <Badge className="student-class-badge" data-class={student.className} variant="secondary">
            {student.className}
          </Badge>
          <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${student.name}`}>
            ···
          </Button>
        </div>
        <div className="student-card-metrics">
          <div>
            <span>Lexile</span>
            <strong>{student.lexile}L</strong>
          </div>
          <div>
            <span>AR / ZPD</span>
            <strong>
              {student.ar} ({student.zpd})
            </strong>
          </div>
        </div>
        <div className="student-card-footer" data-status={student.status}>
          <span className="student-status-dot" />
          <strong>{statusLabel}</strong>
          <span>·</span>
          <span>Active {student.lastActive}</span>
        </div>
      </CardContent>
    </Card>
  );
}

const taskPeriods = ["This Week (May 11 - May 17)", "Last Week", "This Month", "This Quarter"];
const assignedClassScopes = ["All Classes", "Grade 5 Reading A", "Grade 6 Skills B", "Grade 4 Reading"];

const assignedMetrics = [
  {
    title: "Completion Rate",
    value: "80%",
    detail: "16 / 20 students",
    icon: CheckCircle2,
    tone: "green",
    ring: 80,
  },
  {
    title: "Tasks Assigned This Week",
    value: "18",
    detail: "Across 7 different tasks",
    icon: CalendarDays,
    tone: "purple",
  },
  {
    title: "Waiting for Feedback",
    value: "12",
    detail: "Needs your review",
    icon: MessageCircle,
    tone: "amber",
  },
  {
    title: "Overdue Tasks",
    value: "3",
    detail: "3 students affected",
    icon: CircleAlert,
    tone: "red",
  },
];

const taskStatusBreakdown = [
  { label: "Completed", value: 80, percent: 59, color: "var(--primary)" },
  { label: "In Progress", value: 28, percent: 21, color: "#f59e0b" },
  { label: "Overdue", value: 12, percent: 9, color: "#ff2d55" },
  { label: "Not Started", value: 16, percent: 12, color: "#e5e7eb" },
];

const leaderboard = [
  { rank: 1, name: "Aaliyah Johnson", avatar: "AJ", done: 8, total: 8, rate: 100, color: "#8b4b32" },
  { rank: 2, name: "Ethan Kim", avatar: "EK", done: 6, total: 7, rate: 86, color: "#b36f3c" },
  { rank: 3, name: "Mia Rodriguez", avatar: "MR", done: 6, total: 8, rate: 75, color: "#9a5038" },
  { rank: 4, name: "Liam Chen", avatar: "LC", done: 5, total: 7, rate: 71, color: "#c47a3f" },
  { rank: 5, name: "Sophia Patel", avatar: "SP", done: 4, total: 8, rate: 50, color: "#7d3f2e" },
];

const lexileDistribution = [
  { label: "< 600L", value: 8 },
  { label: "600L-800L", value: 20 },
  { label: "800L-1000L", value: 34 },
  { label: "1000L-1200L", value: 26 },
  { label: "> 1200L", value: 12 },
];

const typeDistribution = [
  { label: "Reading", value: 48 },
  { label: "Writing", value: 36 },
  { label: "Quiz", value: 24 },
  { label: "Video", value: 16 },
  { label: "Discussion", value: 12 },
];

const genreDistribution = [
  { label: "Fiction", value: 46 },
  { label: "Nonfiction", value: 38 },
  { label: "Poetry", value: 18 },
  { label: "Biography", value: 16 },
  { label: "Informational", value: 18 },
];

function CompletionRing({ value }: { value: number }) {
  return (
    <span
      className="completion-ring"
      style={{ "--ring-value": `${value}%` } as CSSProperties}
      aria-label={`${value}% completion`}
    />
  );
}

function AssignedMetricCard({ metric }: { metric: (typeof assignedMetrics)[number] }) {
  const Icon = metric.icon;

  return (
    <Card className="assigned-metric-card" data-tone={metric.tone}>
      <CardContent>
        <div className="metric-visual" aria-hidden="true">
          {metric.ring ? <CompletionRing value={metric.ring} /> : <Icon size={34} strokeWidth={2.35} />}
        </div>
        <div>
          <p>{metric.title}</p>
          <strong>{metric.value}</strong>
          <span>{metric.detail}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusDonut() {
  return (
    <Card className="task-status-card">
      <CardHeader>
        <CardTitle>Task Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="task-status-layout">
          <div className="status-donut" aria-label="Task status chart">
            <div>
              <span>Total</span>
              <strong>136</strong>
              <span>Tasks</span>
            </div>
          </div>
          <div className="status-legend">
            {taskStatusBreakdown.map((item) => (
              <div key={item.label}>
                <i style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
                <strong>
                  {item.value} ({item.percent}%)
                </strong>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="status-detail-button">
          View task status details
          <ChevronRight size={20} />
        </Button>
      </CardFooter>
    </Card>
  );
}

function LeaderboardCard() {
  return (
    <Card className="leaderboard-card">
      <CardHeader>
        <CardTitle>
          <Trophy size={24} />
          Student Completion Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="leaderboard-head">
          <span>#</span>
          <span>Student</span>
          <span>Completed / Assigned</span>
          <span>Completion Rate</span>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((student) => (
            <div className="leaderboard-row" key={student.name}>
              <Badge variant="secondary" className="rank-badge" data-rank={student.rank}>
                {student.rank}
              </Badge>
              <div className="leaderboard-student">
                <span className="leaderboard-avatar" style={{ backgroundColor: student.color }}>
                  {student.avatar}
                </span>
                <strong>{student.name}</strong>
              </div>
              <span>
                {student.done} / {student.total}
              </span>
              <div className="leaderboard-rate">
                <span className="progress-track">
                  <i style={{ width: `${student.rate}%` }} />
                </span>
                <strong>{student.rate}%</strong>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionLineChart({
  title,
  icon,
  data,
  tone = "green",
  yMax,
}: {
  title: string;
  icon: typeof BookOpen;
  data: Array<{ label: string; value: number }>;
  tone?: "green" | "purple";
  yMax: number;
}) {
  const Icon = icon;
  const width = 420;
  const height = 210;
  const padding = { top: 22, right: 18, bottom: 46, left: 44 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const points = data.map((item, index) => {
    const x = padding.left + (chartWidth / (data.length - 1)) * index;
    const y = padding.top + chartHeight - (item.value / yMax) * chartHeight;
    return { ...item, x, y };
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaString = `${padding.left},${height - padding.bottom} ${pointString} ${width - padding.right},${height - padding.bottom}`;
  const gridLines = [0, 15, 30, 45, 60].filter((value) => value <= yMax);

  return (
    <Card className="distribution-card" data-tone={tone}>
      <CardHeader>
        <CardTitle>
          <Icon size={21} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
          <text x="0" y="18" className="chart-axis-title">
            Tasks
          </text>
          {gridLines.map((tick) => {
            const y = padding.top + chartHeight - (tick / yMax) * chartHeight;
            return (
              <g key={tick}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-grid-line" />
                <text x="18" y={y + 5} className="chart-tick">
                  {tick}
                </text>
              </g>
            );
          })}
          <polygon points={areaString} className="chart-area" />
          <polyline points={pointString} className="chart-line" />
          {points.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="5" className="chart-point" />
              <text x={point.x} y={point.y - 12} textAnchor="middle" className="chart-value">
                {point.value}
              </text>
              <text x={point.x} y={height - 18} textAnchor="middle" className="chart-label">
                {point.label}
              </text>
            </g>
          ))}
          <text x={width / 2} y={height - 2} textAnchor="middle" className="chart-x-title">
            {tone === "green" ? "Lexile Range" : "Task Type"}
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}

function GenreDistributionCard() {
  const max = Math.max(...genreDistribution.map((item) => item.value));

  return (
    <Card className="distribution-card genre-distribution-card">
      <CardHeader>
        <CardTitle>
          <BookOpen size={21} />
          Assigned Task Genre Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bar-chart" role="img" aria-label="Assigned Task Genre Distribution">
          <span className="bar-axis-title">Tasks</span>
          <div className="bar-grid" aria-hidden="true">
            {[60, 45, 30, 15, 0].map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="bar-list">
            {genreDistribution.map((item) => (
              <div className="bar-item" key={item.label}>
                <strong>{item.value}</strong>
                <i style={{ height: `${Math.max(12, (item.value / max) * 100)}%` }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <span className="bar-x-title">Genre</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ClassView() {
  const [taskPeriod, setTaskPeriod] = useState(taskPeriods[0]);
  const [classScope, setClassScope] = useState(assignedClassScopes[0]);

  return (
    <main className="workspace assigned-dashboard">
      <aside className="assigned-sidebar" aria-label="Assigned task actions">
        <Card className="assign-hero-card">
          <CardContent>
            <span className="assign-hero-icon">
              <ClipboardPlus size={46} />
            </span>
            <div>
              <CardTitle>Assign Task</CardTitle>
              <CardDescription>Choose content and assign to students in a few simple steps.</CardDescription>
            </div>
            <Button variant="secondary" size="lg" className="assign-new-task-button">
              Assign New Task
              <ChevronRight size={22} />
            </Button>
            <BookOpen className="assign-hero-watermark" size={150} strokeWidth={1.65} aria-hidden="true" />
          </CardContent>
        </Card>

        <Card className="feedback-summary-card">
          <CardContent>
            <div className="feedback-heading">
              <span>
                <MessageSquareText size={30} />
              </span>
              <div>
                <CardTitle>Feedback</CardTitle>
                <CardDescription>Review and provide feedback to help students improve and stay on track.</CardDescription>
              </div>
            </div>
            <div className="feedback-action-grid">
              <Button variant="outline" className="feedback-action-button">
                <UsersRound size={30} />
                <span>
                  <strong>Whole Class</strong>
                  <small>Review all pending feedback</small>
                </span>
              </Button>
              <Button variant="outline" className="feedback-action-button">
                <UsersRound size={30} />
                <span>
                  <strong>Single Student</strong>
                  <small>View all tasks for one student</small>
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="assigned-notice-card" data-tone="alert">
          <CardContent>
            <AlertTriangle size={42} />
            <div>
              <CardTitle>Attention Needed</CardTitle>
              <CardDescription>3 students have overdue tasks</CardDescription>
            </div>
            <ChevronRight size={24} />
          </CardContent>
        </Card>

        <Card className="assigned-notice-card" data-tone="reminder">
          <CardContent>
            <Bell size={42} />
            <div>
              <CardTitle>Reminder</CardTitle>
              <CardDescription>You have 12 submissions waiting for feedback.</CardDescription>
            </div>
            <ChevronRight size={24} />
          </CardContent>
        </Card>
      </aside>

      <Card className="assigned-main-panel">
        <CardContent>
          <div className="assigned-toolbar">
            <Select value={taskPeriod} onValueChange={(value) => value && setTaskPeriod(value)}>
              <SelectTrigger className="assigned-select-trigger">
                <CalendarDays size={20} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskPeriods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={classScope} onValueChange={(value) => value && setClassScope(value)}>
              <SelectTrigger className="assigned-select-trigger compact">
                <UsersRound size={20} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignedClassScopes.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <section className="assigned-top-grid">
            <div className="assigned-small-metrics">
              {assignedMetrics.map((metric) => (
                <AssignedMetricCard key={metric.title} metric={metric} />
              ))}
            </div>
            <StatusDonut />
            <LeaderboardCard />
          </section>

          <section className="assigned-chart-grid">
            <DistributionLineChart
              title="Assigned Task Lexile Distribution"
              icon={BookOpen}
              data={lexileDistribution}
              yMax={40}
            />
            <DistributionLineChart
              title="Assigned Task Type Distribution"
              icon={ListChecks}
              data={typeDistribution}
              tone="purple"
              yMax={60}
            />
            <GenreDistributionCard />
          </section>
        </CardContent>
      </Card>
    </main>
  );
}

function getClassStats(classRoom: ClassRoom) {
  return {
    completion: average(classRoom.students.map((student) => student.completionRate)),
    lexile: average(classRoom.students.map((student) => student.readingLevel)),
    needsHelp: classRoom.students.filter((student) => student.risk !== "Low").length,
  };
}

export function App() {
  const [activeView, setActiveView] = useState<"library" | "myclass">("library");

  return (
    <div className="app-frame">
      <section className="showcase-canvas">
        <div className="app-switcher">
          <div>
            <strong>Big Teacher</strong>
            <span>Teacher workspace</span>
          </div>
          <div className="app-tabs">
            <Button
              variant={activeView === "library" ? "default" : "ghost"}
              size="lg"
              onClick={() => setActiveView("library")}
            >
              <LibraryBig size={21} />
              Library
            </Button>
            <Button
              variant={activeView === "myclass" ? "default" : "ghost"}
              size="lg"
              onClick={() => setActiveView("myclass")}
            >
              <UsersRound size={21} />
              MyClass
            </Button>
          </div>
        </div>
        {activeView === "library" ? <LibraryView /> : <ClassView />}
      </section>
    </div>
  );
}

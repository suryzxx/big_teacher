import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  AudioLines,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardPlus,
  FileText,
  MoreHorizontal,
  LibraryBig,
  ListChecks,
  LogOut,
  MessageCircle,
  MessageSquareText,
  Mic,
  MonitorPlay,
  Search,
  Send,
  RefreshCw,
  SlidersHorizontal,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentAvatarImages } from "./assets/mock/students";
import { classes, resources } from "./data/mockData";
import type { ClassRoom, Resource, ResourceGenre, ResourceType, Student } from "./types";

const resourceIcons: Record<ResourceType, typeof BookOpen> = {
  Writing: BookOpen,
  Podcast: AudioLines,
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
type MyClassSection = "students" | "assigned" | "lexile";

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

const typeOptions: ResourceType[] = ["Writing", "Podcast", "Video", "Reading"];

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
  if (type === "Podcast") {
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

  if (type === "Writing") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM10.95 17.51C10.66 17.8 10.11 18.08 9.71 18.14L7.25 18.49C7.16 18.5 7.07 18.51 6.98 18.51C6.57 18.51 6.19 18.37 5.92 18.1C5.59 17.77 5.45 17.29 5.53 16.76L5.88 14.3C5.94 13.89 6.21 13.35 6.51 13.06L10.97 8.6C11.05 8.81 11.13 9.02 11.24 9.26C11.34 9.47 11.45 9.69 11.57 9.89C11.67 10.06 11.78 10.22 11.87 10.34C11.98 10.51 12.11 10.67 12.19 10.76C12.24 10.83 12.28 10.88 12.3 10.9C12.55 11.2 12.84 11.48 13.09 11.69C13.16 11.76 13.2 11.8 13.22 11.81C13.37 11.93 13.52 12.05 13.65 12.14C13.81 12.26 13.97 12.37 14.14 12.46C14.34 12.58 14.56 12.69 14.78 12.8C15.01 12.9 15.22 12.99 15.43 13.06L10.95 17.51ZM17.37 11.09L16.45 12.02C16.39 12.08 16.31 12.11 16.23 12.11C16.2 12.11 16.16 12.11 16.14 12.1C14.11 11.52 12.49 9.9 11.91 7.87C11.88 7.76 11.91 7.64 11.99 7.57L12.92 6.64C14.44 5.12 15.89 5.15 17.38 6.64C18.14 7.4 18.51 8.13 18.51 8.89C18.5 9.61 18.13 10.33 17.37 11.09Z"
          fill="#171717"
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
  onStudentSelectAll,
  onClose,
  onAssign,
}: {
  resource: Resource;
  selectedClassId: string;
  selectedStudentIds: string[];
  onClassChange: (classId: string) => void;
  onStudentToggle: (studentId: string) => void;
  onStudentSelectAll: (studentIds: string[]) => void;
  onClose: () => void;
  onAssign: () => void;
}) {
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const classMenuRef = useRef<HTMLDivElement | null>(null);
  const selectedClass = classes.find((classRoom) => classRoom.id === selectedClassId) ?? null;
  const resourceDetail = "wordCount" in resource ? `${resource.wordCount.toLocaleString()} words` : resource.duration;
  const allStudentIds = selectedClass?.students.map((student) => student.id) ?? [];
  const allStudentsSelected = allStudentIds.length > 0 && allStudentIds.every((studentId) => selectedStudentIds.includes(studentId));

  useEffect(() => {
    if (!classMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!classMenuRef.current?.contains(event.target as Node)) {
        setClassMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [classMenuOpen]);

  return (
    <div className="assign-backdrop" role="dialog" aria-modal="true" aria-label={`Assign ${resource.title}`}>
      <Card className="assign-dialog">
        <CardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
          <div />
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close assign dialog" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="assign-dialog-content">
          <section className="assign-resource-info" aria-label="Resource details">
            <h2>{resource.title}</h2>
            <div>
              <Badge variant="secondary">{resource.type}</Badge>
              <Badge variant="secondary">{resource.lexile}L</Badge>
              <Badge variant="secondary">{resourceDetail}</Badge>
              <Badge variant="secondary">{resource.genre}</Badge>
            </div>
          </section>

          <section className="assign-section">
            <div>
              <h3>choose class</h3>
            </div>
            <div className="assign-class-select" ref={classMenuRef}>
              <button
                type="button"
                className="assign-class-select-trigger"
                aria-haspopup="listbox"
                aria-expanded={classMenuOpen}
                onClick={() => setClassMenuOpen((isOpen) => !isOpen)}
              >
                <span>{selectedClass?.name ?? "Select class"}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
              {classMenuOpen && (
                <div className="assign-class-select-menu" role="listbox" aria-label="Class options">
                {classes.map((classRoom) => (
                  <button
                    key={classRoom.id}
                    type="button"
                    className="assign-class-select-option"
                    data-active={classRoom.id === selectedClassId}
                    role="option"
                    aria-selected={classRoom.id === selectedClassId}
                    onClick={() => {
                      onClassChange(classRoom.id);
                      setClassMenuOpen(false);
                    }}
                  >
                    {classRoom.name}
                  </button>
                ))}
                </div>
              )}
            </div>
          </section>

          <section className="assign-section assign-students-section" data-ready={Boolean(selectedClass)}>
            <div>
              <h3>choose students</h3>
            </div>
            {selectedClass ? (
              <div className="assign-student-grid">
              <button
                type="button"
                className="assign-student-card assign-student-select-all-card"
                data-selected={allStudentsSelected}
                aria-pressed={allStudentsSelected}
                onClick={() => onStudentSelectAll(allStudentIds)}
              >
                <span className="assign-select-all-mark">
                  <CheckCircle2 size={20} aria-hidden="true" />
                </span>
                <span>
                  <span>Select all</span>
                  <small>{selectedClass.students.length} students</small>
                </span>
              </button>
              {selectedClass.students.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    className="assign-student-card"
                    data-selected={isSelected}
                    aria-pressed={isSelected}
                    onClick={() => onStudentToggle(student.id)}
                  >
                    <span className="avatar" style={student.avatarImage ? undefined : { backgroundColor: student.avatarColor }}>
                      {student.avatarImage ? (
                        <img src={student.avatarImage} alt="" />
                      ) : (
                        student.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                      )}
                    </span>
                    <span>
                      <span>{student.name}</span>
                      <small>{student.readingLevel}L</small>
                    </span>
                  </button>
                );
              })}
              </div>
            ) : (
              <div className="assign-student-grid assign-student-grid-placeholder" aria-hidden="true">
                {Array.from({ length: 9 }, (_, index) => (
                  <span className="assign-student-card assign-student-placeholder-card" key={index} />
                ))}
              </div>
            )}
          </section>
        </CardContent>

        <CardFooter className="assign-dialog-footer">
          <Badge variant="secondary">{selectedStudentIds.length} selected</Badge>
          <div>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!selectedClass || selectedStudentIds.length === 0} onClick={onAssign}>
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
  const [assignClassId, setAssignClassId] = useState("");
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
        type !== "Writing" && type !== "Reading" ? true : "wordCount" in resource && resource.wordCount >= minWords && resource.wordCount <= maxWords;
      const matchesDuration =
        type !== "Podcast" && type !== "Video"
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
    setAssignClassId("");
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

  function toggleAssignAllStudents(studentIds: string[]) {
    setAssignStudentIds((currentIds) =>
      studentIds.length > 0 && studentIds.every((studentId) => currentIds.includes(studentId)) ? [] : studentIds,
    );
  }

  function confirmAssign() {
    if (!assignResource || !assignClassId || assignStudentIds.length === 0) return;

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
          onStudentSelectAll={toggleAssignAllStudents}
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
              {(type === "Writing" || type === "Reading") && (
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
              {(type === "Podcast" || type === "Video") && (
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
        <span className="avatar" style={student.avatarImage ? undefined : { backgroundColor: student.avatarColor }}>
          {student.avatarImage ? <img src={student.avatarImage} alt="" /> : getInitials(student.name)}
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
  className: string;
  avatarColor: string;
  avatarImage: string;
  lexile: number;
  ar: number;
  zpd: string;
  activeTasks: number;
  lastActive: string;
  status: StudentDirectoryStatus;
};

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

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

function convertLexileToAr(lexile: number) {
  const sortedPairs = lexileArPairs;
  const clampedLexile = clampNumber(lexile, sortedPairs[0].lexile, sortedPairs[sortedPairs.length - 1].lexile);
  const upperIndex = sortedPairs.findIndex((pair) => pair.lexile >= clampedLexile);
  if (upperIndex <= 0) return sortedPairs[0].ar;

  const lower = sortedPairs[upperIndex - 1];
  const upper = sortedPairs[upperIndex];
  const ratio = (clampedLexile - lower.lexile) / (upper.lexile - lower.lexile);
  return Number((lower.ar + (upper.ar - lower.ar) * ratio).toFixed(1));
}

function convertArToLexile(ar: number) {
  const sortedPairs = lexileArPairs;
  const clampedAr = clampNumber(ar, sortedPairs[0].ar, sortedPairs[sortedPairs.length - 1].ar);
  const upperIndex = sortedPairs.findIndex((pair) => pair.ar >= clampedAr);
  if (upperIndex <= 0) return sortedPairs[0].lexile;

  const lower = sortedPairs[upperIndex - 1];
  const upper = sortedPairs[upperIndex];
  const ratio = (clampedAr - lower.ar) / (upper.ar - lower.ar);
  return roundToStep(lower.lexile + (upper.lexile - lower.lexile) * ratio, 10);
}

const classScopeOptions = ["All Classes", "G4-Rainbow Class"];
const studentStatusOptions = ["All", "Active", "Needs support"];

const studentDirectorySeeds = [
  ["Aaliyah Johnson", 930, 5.1, "ok"],
  ["Ethan Kim", 880, 4.7, "ok"],
  ["Mia Rodriguez", 810, 4.2, "watch"],
  ["Liam Chen", 760, 3.6, "ok"],
  ["Sophia Patel", 710, 3.2, "ok"],
  ["Noah Thompson", 980, 5.6, "watch"],
  ["Isabella Garcia", 840, 4.5, "ok"],
  ["James Wilson", 690, 3.1, "support"],
  ["Olivia Martinez", 900, 4.9, "ok"],
  ["Benjamin Moore", 770, 3.8, "ok"],
  ["Chloe Anderson", 860, 4.6, "ok"],
  ["William Taylor", 650, 2.9, "support"],
  ["Lucas Brown", 720, 3.4, "watch"],
  ["Ava Davis", 800, 4.1, "ok"],
  ["Daniel Park", 875, 4.8, "ok"],
  ["Emily Nguyen", 735, 3.5, "ok"],
  ["Mason Lee", 915, 5.0, "ok"],
  ["Harper Chen", 795, 4.0, "watch"],
  ["Jackson Wu", 685, 3.0, "support"],
  ["Ella Kim", 850, 4.4, "ok"],
  ["Logan Smith", 740, 3.7, "ok"],
  ["Amelia Wang", 890, 4.9, "ok"],
  ["Jayden Zhao", 705, 3.3, "watch"],
  ["Lily Zhou", 825, 4.3, "ok"],
  ["Ryan Lin", 780, 3.9, "ok"],
] satisfies Array<[string, number, number, StudentDirectoryStatus]>;

const studentDirectory: StudentDirectoryEntry[] = studentDirectorySeeds.map(([name, lexile, ar, status], index) => ({
  id: `STU-${String(10031 + index).padStart(5, "0")}`,
  name,
  className: "G4-Rainbow Class",
  avatarColor: "#ffffff",
  avatarImage: studentAvatarImages[index % studentAvatarImages.length],
  lexile,
  ar,
  zpd: "",
  activeTasks: index % 4,
  lastActive: index % 5 === 0 ? "30m ago" : `${(index % 6) + 1}h ago`,
  status,
}));

type CompletionLeaderboardStudent = ReturnType<typeof createCompletionLeaderboard>[number];
type StudentDetailTab = "tasks" | "report";
type StudentDetailStudent = CompletionLeaderboardStudent & {
  id: string;
  lexile: number;
  ar: number;
  trend: number;
  accuracy: number;
};

function StudentOverviewCard({
  tone,
  title,
  primary,
  secondary,
}: {
  tone: "green" | "amber" | "blue" | "pink";
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

function StudentDirectoryCard({
  student,
  onUpdate,
  onViewDetail,
}: {
  student: StudentDirectoryEntry;
  onUpdate: (studentId: string, values: Pick<StudentDirectoryEntry, "lexile" | "ar">) => void;
  onViewDetail: (student: StudentDirectoryEntry) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [lexileValue, setLexileValue] = useState(String(student.lexile));
  const [arValue, setArValue] = useState(String(student.ar));
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!editOpen) return;
    setLexileValue(String(student.lexile));
    setArValue(String(student.ar));
  }, [editOpen, student.ar, student.lexile]);

  function normalizeLexileInput(value: string) {
    const parsedLexile = Number(value);
    if (!Number.isFinite(parsedLexile)) return null;
    return roundToStep(clampNumber(parsedLexile, lexileArPairs[0].lexile, lexileArPairs[lexileArPairs.length - 1].lexile), 10);
  }

  function normalizeArInput(value: string) {
    const parsedAr = Number(value);
    if (!Number.isFinite(parsedAr)) return null;
    return Number(clampNumber(parsedAr, lexileArPairs[0].ar, lexileArPairs[lexileArPairs.length - 1].ar).toFixed(1));
  }

  function changeLexile(nextLexile: string) {
    setLexileValue(nextLexile);
    if (nextLexile.trim() === "") return;

    const normalizedLexile = normalizeLexileInput(nextLexile);
    if (normalizedLexile === null) return;
    setArValue(String(convertLexileToAr(normalizedLexile)));
  }

  function changeAr(nextAr: string) {
    setArValue(nextAr);
    if (nextAr.trim() === "") return;

    const normalizedAr = normalizeArInput(nextAr);
    if (normalizedAr === null) return;
    setLexileValue(String(convertArToLexile(normalizedAr)));
  }

  function saveLexileAr() {
    const normalizedLexile = normalizeLexileInput(lexileValue);
    const normalizedAr = normalizeArInput(arValue);

    if (normalizedLexile === null && normalizedAr === null) {
      setLexileValue(String(student.lexile));
      setArValue(String(student.ar));
      return;
    }

    const nextLexile = normalizedLexile ?? convertArToLexile(normalizedAr ?? student.ar);
    const nextAr = normalizedAr ?? convertLexileToAr(nextLexile);
    onUpdate(student.id, { lexile: nextLexile, ar: nextAr });
    setEditOpen(false);
  }

  return (
    <>
      <Card className="student-directory-card">
        <CardContent>
          <div className="student-card-actions" ref={menuRef}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Open ${student.name} actions`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreHorizontal size={18} />
            </Button>
            {menuOpen && (
              <div className="student-card-action-menu">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditOpen(true);
                  }}
                >
                  Modify Lexile/AR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onViewDetail(student);
                  }}
                >
                  View Detail
                </button>
              </div>
            )}
          </div>
          <div className="student-card-top">
            <span className="student-photo-placeholder">
              <img src={student.avatarImage} alt={`${student.name} avatar`} />
            </span>
            <div>
              <h3>{student.name}</h3>
              <p>{student.id}</p>
            </div>
          </div>
          <div className="student-card-metrics">
            <div>
              <span>Lexile</span>
              <strong>{student.lexile}L</strong>
            </div>
            <div>
              <span>AR</span>
              <strong>{student.ar}</strong>
            </div>
          </div>
        </CardContent>
      </Card>
      {editOpen && (
        <div className="feedback-backdrop" role="dialog" aria-modal="true" aria-label={`${student.name} Lexile and AR editor`}>
          <Card className="student-lexile-editor">
            <CardHeader>
              <div className="student-task-dialog-title">
                <span className="leaderboard-avatar">
                  <img src={student.avatarImage} alt="" />
                </span>
                <div>
                  <CardDescription>{student.id}</CardDescription>
                  <CardTitle>{student.name}</CardTitle>
                </div>
              </div>
              <CardAction>
                <Button variant="ghost" size="icon-sm" aria-label="Close Lexile and AR editor" onClick={() => setEditOpen(false)}>
                  <X size={18} />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <label>
                <span>Lexile</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={lexileValue}
                  onChange={(event) => changeLexile(event.target.value)}
                />
              </label>
              <label>
                <span>AR</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={arValue}
                  onChange={(event) => changeAr(event.target.value)}
                />
              </label>
            </CardContent>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveLexileAr}>
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}

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
  { label: "Not Started", value: 16, percent: 12, color: "#e5e7eb" },
];

const taskStatusChartConfig = {
  completed: { label: "Completed", color: "var(--primary)" },
  inProgress: { label: "In Progress", color: "#f59e0b" },
  notStarted: { label: "Not Started", color: "#e5e7eb" },
} satisfies ChartConfig;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function createCompletionLeaderboard(students: Student[]) {
  return [...students]
    .sort((a, b) => b.completionRate - a.completionRate || b.weeklyMinutes - a.weeklyMinutes)
    .map((student, index) => {
      const total = 8 + (index % 3);
      const completed = Math.min(total, Math.round((student.completionRate / 100) * total));
      const remaining = total - completed;
      const inProgress = Math.min(remaining, student.risk === "High" ? 1 : student.risk === "Medium" ? 2 : index % 2);
      const notStarted = Math.max(0, remaining - inProgress);

      return {
        id: student.id,
        rank: index + 1,
        name: student.name,
        avatar: getInitials(student.name),
        avatarImage: student.avatarImage,
        readingLevel: student.readingLevel,
        tasks: student.tasks,
        completed,
        inProgress,
        notStarted,
        done: completed,
        total,
        rate: student.completionRate,
        color: student.avatarColor,
      };
    });
}

const leaderboard = createCompletionLeaderboard(classes[0].students);

function getCompletionStudentFromDirectory(student: StudentDirectoryEntry): CompletionLeaderboardStudent {
  const matchedStudent = leaderboard.find((item) => item.name === student.name) ?? leaderboard[0];

  return {
    ...matchedStudent,
    name: student.name,
    avatar: getInitials(student.name),
    avatarImage: student.avatarImage,
    readingLevel: student.lexile,
    color: student.avatarColor,
  };
}

const lexileDistribution = [
  { label: "< 600L", value: 8 },
  { label: "600L-800L", value: 20 },
  { label: "800L-1000L", value: 34 },
  { label: "1000L-1200L", value: 26 },
  { label: "> 1200L", value: 12 },
];

const typeDistribution = [
  { label: "Reading", value: 48 },
  { label: "Video", value: 24 },
  { label: "Podcast", value: 18 },
  { label: "Writing prompt", value: 12 },
];

const genreDistribution = [
  { label: "Fiction", value: 46 },
  { label: "Nonfiction", value: 38 },
  { label: "Poetry", value: 18 },
  { label: "Biography", value: 16 },
  { label: "Informational", value: 18 },
];

const assignedTaskRowsByWeek = {
  "this-week": [
    {
      id: 1,
      taskName: "Garden Path Reading",
      recipient: "Aaliyah Johnson",
      taskType: "Reading",
      sentAt: "May 11, 09:20",
      submittedAt: "May 12, 13:48",
      status: "Completed",
      completedAt: "May 12, 14:05",
    },
    {
      id: 2,
      taskName: "Ocean Animals Video",
      recipient: "Ethan Kim",
      taskType: "Video",
      sentAt: "May 11, 10:15",
      submittedAt: "-",
      status: "In Progress",
      completedAt: "-",
    },
    {
      id: 3,
      taskName: "Biography Podcast",
      recipient: "Mia Rodriguez",
      taskType: "Podcast",
      sentAt: "May 12, 08:45",
      submittedAt: "May 13, 10:56",
      status: "Completed",
      completedAt: "May 13, 11:30",
    },
    {
      id: 4,
      taskName: "Fiction Response",
      recipient: "Liam Chen",
      taskType: "Writing prompt",
      sentAt: "May 13, 13:10",
      submittedAt: "-",
      status: "Not Started",
      completedAt: "-",
    },
    {
      id: 5,
      taskName: "Lexile Practice Set",
      recipient: "Sophia Patel",
      taskType: "Reading",
      sentAt: "May 14, 09:00",
      submittedAt: "-",
      status: "In Progress",
      completedAt: "-",
    },
  ],
  "last-week": [
    {
      id: 1,
      taskName: "Main Idea Reading",
      recipient: "Noah Thompson",
      taskType: "Reading",
      sentAt: "May 04, 09:10",
      submittedAt: "May 05, 10:36",
      status: "Completed",
      completedAt: "May 05, 10:50",
    },
    {
      id: 2,
      taskName: "Science Video Notes",
      recipient: "Isabella Garcia",
      taskType: "Video",
      sentAt: "May 05, 11:30",
      submittedAt: "May 06, 12:58",
      status: "Completed",
      completedAt: "May 06, 13:15",
    },
    {
      id: 3,
      taskName: "Podcast Reflection",
      recipient: "James Wilson",
      taskType: "Podcast",
      sentAt: "May 06, 08:40",
      submittedAt: "-",
      status: "In Progress",
      completedAt: "-",
    },
    {
      id: 4,
      taskName: "Short Story Quiz",
      recipient: "Olivia Martinez",
      taskType: "Reading",
      sentAt: "May 07, 14:00",
      submittedAt: "May 08, 09:12",
      status: "Completed",
      completedAt: "May 08, 09:35",
    },
    {
      id: 5,
      taskName: "Vocabulary Practice",
      recipient: "Benjamin Moore",
      taskType: "Writing prompt",
      sentAt: "May 08, 10:20",
      submittedAt: "-",
      status: "Not Started",
      completedAt: "-",
    },
  ],
};

type AssignedTaskWeek = keyof typeof assignedTaskRowsByWeek;

type AssignedBentoId =
  | "completion"
  | "assigned"
  | "feedback"
  | "overdue"
  | "status"
  | "leaderboard"
  | "lexile"
  | "type"
  | "genre";

const assignedBentoCards: Array<{
  id: AssignedBentoId;
  title: string;
  value: string;
  detail: string;
  icon: typeof BookOpen;
  tone: "green" | "purple" | "amber" | "red" | "blue";
}> = [
  { id: "completion", title: "Completion Rate", value: "80%", detail: "20 / 25 students", icon: CheckCircle2, tone: "green" },
  { id: "assigned", title: "Tasks Assigned", value: "18", detail: "This week", icon: CalendarDays, tone: "purple" },
  { id: "feedback", title: "Waiting Feedback", value: "12", detail: "Needs review", icon: MessageCircle, tone: "amber" },
  { id: "overdue", title: "Overdue Tasks", value: "3", detail: "3 students affected", icon: CircleAlert, tone: "red" },
  { id: "status", title: "Status Breakdown", value: "136", detail: "Total tasks", icon: ListChecks, tone: "green" },
  { id: "leaderboard", title: "Leaderboard", value: "100%", detail: "Top completion", icon: Trophy, tone: "amber" },
  { id: "lexile", title: "Lexile Distribution", value: "34", detail: "800L-1000L peak", icon: BookOpen, tone: "green" },
  { id: "type", title: "Type Distribution", value: "48", detail: "Reading tasks", icon: FileText, tone: "purple" },
  { id: "genre", title: "Genre Distribution", value: "46", detail: "Fiction tasks", icon: LibraryBig, tone: "blue" },
];

const myClassSections: Array<{
  key: MyClassSection;
  title: string;
  primary: string;
  secondary: string;
  detail: string;
  icon: typeof BookOpen;
  iconImage: string;
  tone: "green" | "purple" | "amber" | "blue" | "pink";
}> = [
  {
    key: "students",
    title: "Total Students",
    primary: "25 students",
    secondary: "1 class",
    detail: "",
    icon: UsersRound,
    iconImage: `${import.meta.env.BASE_URL}myclass-icons/students.png`,
    tone: "green",
  },
  {
    key: "assigned",
    title: "Assigned Tasks",
    primary: "27 active",
    secondary: "64 total this month",
    detail: "",
    icon: ClipboardPlus,
    iconImage: `${import.meta.env.BASE_URL}myclass-icons/assigned-tasks.png`,
    tone: "amber",
  },
  {
    key: "lexile",
    title: "Report",
    primary: "820L",
    secondary: "Avg. Lexile",
    detail: "Avg. AR 4.2",
    icon: ListChecks,
    iconImage: `${import.meta.env.BASE_URL}myclass-icons/lexile-ar.png`,
    tone: "blue",
  },
];

const lexileTrend = [
  { label: "Jan", lexile: 680, ar: 3.2 },
  { label: "Feb", lexile: 720, ar: 3.5 },
  { label: "Mar", lexile: 780, ar: 3.9 },
  { label: "Apr", lexile: 860, ar: 4.4 },
  { label: "May", lexile: 930, ar: 4.8 },
  { label: "Jun", lexile: 1000, ar: 5.1 },
];

const arClassDistribution = [
  { label: "1.0-2.0", value: 8 },
  { label: "2.1-3.0", value: 16 },
  { label: "3.1-4.0", value: 24 },
  { label: "4.1-5.0", value: 20 },
  { label: "5.1+", value: 14 },
];

const lexileLeaderboard = [
  { rank: 1, name: "Sophia Patel", lexile: 1280, ar: 6.2, trend: 150, accuracy: 94 },
  { rank: 2, name: "Ethan Kim", lexile: 1180, ar: 5.8, trend: 190, accuracy: 91 },
  { rank: 3, name: "Mia Rodriguez", lexile: 1040, ar: 5.4, trend: 160, accuracy: 88 },
  { rank: 4, name: "Aaliyah Johnson", lexile: 1000, ar: 5.1, trend: 120, accuracy: 86 },
  { rank: 5, name: "Liam Chen", lexile: 960, ar: 4.9, trend: 110, accuracy: 84 },
  { rank: 6, name: "Noah Thompson", lexile: 940, ar: 4.7, trend: 95, accuracy: 82 },
  { rank: 7, name: "Olivia Martinez", lexile: 910, ar: 4.5, trend: 88, accuracy: 80 },
].map((student) => {
  const directoryEntry = studentDirectory.find((entry) => entry.name === student.name);

  return {
    ...student,
    avatar: getInitials(student.name),
    avatarImage: directoryEntry?.avatarImage,
    color: directoryEntry?.avatarColor ?? "#9a5038",
    id: directoryEntry?.id ?? `STU-${student.rank}`,
  };
});

function getReportStudentFromDirectory(student: StudentDirectoryEntry): (typeof lexileLeaderboard)[number] {
  const matchedStudent = lexileLeaderboard.find((item) => item.name === student.name) ?? lexileLeaderboard[0];

  return {
    ...matchedStudent,
    name: student.name,
    lexile: student.lexile,
    ar: student.ar,
    avatar: getInitials(student.name),
    avatarImage: student.avatarImage,
    color: student.avatarColor,
    id: student.id,
  };
}

function createStudentDetailStudent(
  taskStudent: CompletionLeaderboardStudent,
  reportStudent?: (typeof lexileLeaderboard)[number],
): StudentDetailStudent {
  const matchedReport = reportStudent ?? lexileLeaderboard.find((item) => item.name === taskStudent.name);
  const reportLexile = matchedReport?.lexile ?? taskStudent.readingLevel;
  const reportAr = matchedReport?.ar ?? convertLexileToAr(reportLexile);

  return {
    ...taskStudent,
    id: matchedReport?.id ?? taskStudent.id,
    lexile: reportLexile,
    ar: reportAr,
    trend: matchedReport?.trend ?? Math.max(45, Math.round(taskStudent.rate * 0.9)),
    accuracy: matchedReport?.accuracy ?? taskStudent.rate,
    avatar: taskStudent.avatar || matchedReport?.avatar || getInitials(taskStudent.name),
    avatarImage: taskStudent.avatarImage ?? matchedReport?.avatarImage,
    color: taskStudent.color || matchedReport?.color || "#ffffff",
    readingLevel: taskStudent.readingLevel || reportLexile,
  };
}

function getStudentDetailFromDirectory(student: StudentDirectoryEntry) {
  return createStudentDetailStudent(getCompletionStudentFromDirectory(student), getReportStudentFromDirectory(student));
}

function getStudentDetailFromReportStudent(student: (typeof lexileLeaderboard)[number]) {
  const matchedTaskStudent = leaderboard.find((item) => item.name === student.name) ?? leaderboard[0];
  return createStudentDetailStudent(matchedTaskStudent, student);
}

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

function AssignedStatusRadialChart() {
  const chartData = taskStatusBreakdown.map((item) => ({
    name: item.label,
    value: item.value,
    fill: item.color,
  }));

  return (
    <ChartContainer config={taskStatusChartConfig} className="assigned-status-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            startAngle={90}
            endAngle={-270}
            innerRadius="58%"
            outerRadius="82%"
            stroke="var(--card)"
            strokeWidth={3}
            cornerRadius={4}
            isAnimationActive
            animationBegin={80}
            animationDuration={1100}
            animationEasing="ease-out"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="assigned-status-chart-center">
        <span>Total</span>
        <strong>136</strong>
        <span>Tasks</span>
      </div>
    </ChartContainer>
  );
}

function LeaderboardArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.91 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.91 4.07996"
        stroke="#171717"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TaskFilterChevronIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19.92 8.94995L13.4 15.47C12.63 16.24 11.37 16.24 10.6 15.47L4.08 8.94995"
        stroke="#171717"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StudentTaskDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <span className="student-task-select" data-open={open} ref={dropdownRef}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        <span>{value}</span>
        <TaskFilterChevronIcon />
      </button>
      {open && (
        <span className="student-task-select-menu">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              data-selected={option === value}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

function StudentCompletionBar({
  student,
  onOpen,
}: {
  student: (typeof leaderboard)[number];
  onOpen: () => void;
}) {
  const completedWidth = (student.completed / student.total) * 100;
  const inProgressWidth = (student.inProgress / student.total) * 100;
  const notStartedWidth = Math.max(0, 100 - completedWidth - inProgressWidth);

  return (
    <div className="leaderboard-status-cell">
      <div className="leaderboard-status-chart" aria-label={`${student.name}: ${student.done} of ${student.total} tasks complete`}>
        <span className="leaderboard-status-segment completed" style={{ width: `${completedWidth}%` }} />
        <span className="leaderboard-status-segment in-progress" style={{ width: `${inProgressWidth}%` }} />
        <span className="leaderboard-status-segment not-started" style={{ width: `${notStartedWidth}%` }} />
        <span className="leaderboard-chart-label">
          {student.done}/{student.total} · {student.rate}%
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="leaderboard-detail-button"
        aria-label={`View ${student.name} task completion`}
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        <LeaderboardArrowIcon />
      </Button>
    </div>
  );
}

function LeaderboardCard({
  onOpenStudent,
}: {
  onOpenStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
}) {

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
          <span>Task Status</span>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((student) => (
            <div
              className="leaderboard-row"
              key={student.name}
              role="button"
              tabIndex={0}
              onClick={() => onOpenStudent(createStudentDetailStudent(student), "tasks")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenStudent(createStudentDetailStudent(student), "tasks");
                }
              }}
            >
              <Badge variant="secondary" className="rank-badge" data-rank={student.rank}>
                {student.rank}
              </Badge>
              <div className="leaderboard-student">
                <span className="leaderboard-avatar" style={student.avatarImage ? undefined : { backgroundColor: student.color }}>
                  {student.avatarImage ? <img src={student.avatarImage} alt="" /> : student.avatar}
                </span>
                <strong>{student.name}</strong>
              </div>
              <StudentCompletionBar student={student} onOpen={() => onOpenStudent(createStudentDetailStudent(student), "tasks")} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentTasksPanel({
  student,
}: {
  student: StudentDetailStudent;
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All time");
  const statusOptions = ["All", "Completed", "In progress", "Not started"];
  const typeOptions = ["All", "Reading", "Video", "Podcast", "Writing"];
  const timeOptions = ["All time", "This week", "This month"];
  const taskStatusSequence = ["Completed", "In progress", "Not started", "Completed", "In progress"];
  const taskTypeSequence = ["Reading", "Video", "Podcast", "Writing", "Reading"];
  const taskMocks = Array.from({ length: 5 }, (_, index) => {
    const task = student.tasks[index % student.tasks.length];
    const status = taskStatusSequence[index];
    const progress = status === "Completed" ? 100 : status === "In progress" ? Math.max(35, Math.min(88, task.progress)) : 0;
    return {
      ...task,
      id: `${task.id}-${index}`,
      status,
      displayType: taskTypeSequence[index],
      progress,
      score: status === "Not started" ? null : task.score ?? progress,
      date: `2026/3/${String(26 + index).padStart(2, "0")} 15:00`,
    };
  });
  const visibleTasks = taskMocks.filter((task, index) => {
    const matchesStatus = statusFilter === "All" || task.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "All" || task.displayType === typeFilter;
    const matchesTime = timeFilter !== "This week" || index < 2;
    return matchesStatus && matchesType && matchesTime;
  });

  return (
    <div className="student-task-dialog-content">
      <div className="student-task-filters">
        <label>
          <span>Status</span>
          <StudentTaskDropdown value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
        </label>
        <label>
          <span>Type</span>
          <StudentTaskDropdown value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
        </label>
        <label>
          <span>Time Range</span>
          <StudentTaskDropdown value={timeFilter} options={timeOptions} onChange={setTimeFilter} />
        </label>
      </div>

      <div className="student-task-card-list">
        {visibleTasks.map((task, index) => {
          const genre = ["Science", "Arts & Culture", "Earth Science"][index % 3];
          const accuracy = task.score ?? task.progress;
          return (
            <div key={task.id} className="student-task-card" data-status={task.status.toLowerCase().replace(/\s+/g, "-")}>
              <div className="student-task-card-head">
                <h3>{task.title}</h3>
                <TaskStatusPill status={task.status} />
              </div>
              <div className="student-task-tags">
                <span>{student.readingLevel + index * 20} L</span>
                <span data-tone="type">{task.displayType}</span>
                <span>{genre}</span>
              </div>
              <div className="student-task-accuracy">
                <span>Accuracy</span>
                <div className="progress-track">
                  <i style={{ width: `${accuracy}%` }} />
                </div>
                <strong>{accuracy}%</strong>
              </div>
              <time>{task.date}</time>
            </div>
          );
        })}
      </div>
    </div>
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

function AssignedBentoExpandedContent({ id }: { id: AssignedBentoId }) {
  if (id === "status") {
    return (
      <div className="bento-status-detail">
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
    );
  }

  if (id === "leaderboard") {
    return (
      <div className="bento-leaderboard-list">
        {leaderboard.map((student) => (
          <div key={student.name}>
            <Badge variant="secondary" className="rank-badge" data-rank={student.rank}>
              {student.rank}
            </Badge>
            <span className="leaderboard-avatar" style={student.avatarImage ? undefined : { backgroundColor: student.color }}>
              {student.avatarImage ? <img src={student.avatarImage} alt="" /> : student.avatar}
            </span>
            <strong>{student.name}</strong>
            <span>
              {student.done}/{student.total}
            </span>
            <em>{student.rate}%</em>
          </div>
        ))}
      </div>
    );
  }

  if (id === "lexile" || id === "type") {
    const data = id === "lexile" ? lexileDistribution : typeDistribution;
    const max = Math.max(...data.map((item) => item.value));

    return (
      <div className="bento-bars" data-tone={id === "type" ? "purple" : "green"}>
        {data.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <i style={{ height: `${Math.max(14, (item.value / max) * 100)}%` }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (id === "genre") {
    const max = Math.max(...genreDistribution.map((item) => item.value));

    return (
      <div className="bento-bars">
        {genreDistribution.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <i style={{ height: `${Math.max(14, (item.value / max) * 100)}%` }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  const detailRows: Record<AssignedBentoId, Array<[string, string]>> = {
    completion: [
      ["Completed students", "16"],
      ["Assigned students", "20"],
      ["Best class", "Grade 5 Reading A"],
      ["Change", "+8% vs last week"],
    ],
    assigned: [
      ["New tasks", "18"],
      ["Different resources", "7"],
      ["Most assigned", "Reading"],
      ["Due this week", "11"],
    ],
    feedback: [
      ["Submitted", "12"],
      ["Quiz review", "5"],
      ["Writing review", "4"],
      ["Discussion review", "3"],
    ],
    overdue: [
      ["Overdue tasks", "3"],
      ["Affected students", "3"],
      ["Longest overdue", "2 days"],
      ["Needs reminder", "Yes"],
    ],
    status: [],
    leaderboard: [],
    lexile: [],
    type: [],
    genre: [],
  };

  return (
    <div className="bento-detail-grid">
      {detailRows[id].map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function AssignedBentoCard({
  card,
  isExpanded,
  isAnyExpanded,
  onToggle,
}: {
  card: (typeof assignedBentoCards)[number];
  isExpanded: boolean;
  isAnyExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = card.icon;

  return (
    <Card
      role="button"
      tabIndex={0}
      className="assigned-bento-card"
      data-tone={card.tone}
      data-expanded={isExpanded}
      data-compressed={isAnyExpanded && !isExpanded}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <CardContent>
        {isExpanded && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="bento-close-button"
            aria-label={`Close ${card.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            <X size={18} />
          </Button>
        )}
        <div className="bento-card-head">
          <span className="bento-card-icon">
            <Icon size={isExpanded ? 30 : 26} />
          </span>
          <div>
            <p>{card.title}</p>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </div>
        </div>
        <div className="bento-expanded-body" aria-hidden={!isExpanded}>
          {isExpanded && <AssignedBentoExpandedContent id={card.id} />}
        </div>
      </CardContent>
    </Card>
  );
}

function MyClassSummaryCard({
  section,
  isActive,
  onSelect,
}: {
  section: (typeof myClassSections)[number];
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="myclass-summary-card"
      data-tone={section.tone}
      data-active={isActive}
      onClick={onSelect}
    >
      <span className="myclass-summary-icon">
        <img src={section.iconImage} alt="" aria-hidden="true" />
      </span>
      <span className="myclass-summary-copy">
        <span>{section.title}</span>
        <strong>{section.primary}</strong>
        <small>
          {section.secondary}
          {section.detail && <em>{section.detail}</em>}
        </small>
      </span>
    </Button>
  );
}

function StudentSection({
  students,
  onUpdateStudent,
  onViewDetail,
}: {
  students: StudentDirectoryEntry[];
  onUpdateStudent: (studentId: string, values: Pick<StudentDirectoryEntry, "lexile" | "ar">) => void;
  onViewDetail: (student: StudentDirectoryEntry) => void;
}) {
  return (
    <section className="student-dashboard">
      <section className="student-directory-grid">
        {students.map((student) => (
          <StudentDirectoryCard
            key={student.id}
            student={student}
            onUpdate={onUpdateStudent}
            onViewDetail={onViewDetail}
          />
        ))}
      </section>
    </section>
  );
}

function AssignedMiniBarChart({
  title,
  data,
  tone,
  isSelected,
  onSelect,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
  tone: "green" | "blue" | "amber";
  isSelected: boolean;
  onSelect: () => void;
}) {
  const max = Math.max(...data.map((item) => item.value));
  const summary =
    tone === "green"
      ? "Lexile Distribution：750～900"
      : tone === "blue"
        ? "Type Distribution：Reading、Video、Podcast、Writing"
        : "Genre Distribution：Fiction、Nonfiction、Biography";

  return (
    <Card
      role="button"
      tabIndex={0}
      className="assigned-mini-chart"
      data-tone={tone}
      data-selected={isSelected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <CardContent>
        {isSelected ? (
          <>
            <strong>{title}</strong>
            <div className="assigned-mini-bars">
              {data.map((item) => (
                <div className="assigned-mini-bar" key={item.label}>
                  <span>{item.value}</span>
                  <i style={{ height: `${Math.max(14, (item.value / max) * 100)}%` }} />
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="assigned-mini-collapsed-copy">
            <p className="assigned-mini-summary">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AssignedTaskWeekSummary({ title }: { title: string }) {
  return (
    <div className="assigned-task-week-summary">
      <CardTitle>{title}</CardTitle>
      <AssignedStatusRadialChart />
    </div>
  );
}

function AssignedTaskListCard({ isSelected, onSelect }: { isSelected: boolean; onSelect: () => void }) {
  const [expandedWeek, setExpandedWeek] = useState<AssignedTaskWeek | null>(null);
  const [expandedStudentByWeek, setExpandedStudentByWeek] = useState<Record<AssignedTaskWeek, string | null>>({
    "this-week": null,
    "last-week": null,
  });
  const weekItems: Array<{ key: AssignedTaskWeek; title: string }> = [
    { key: "this-week", title: "This Week" },
    { key: "last-week", title: "Last Week" },
  ];

  function getTaskStudent(name: string) {
    return studentDirectory.find((student) => student.name === name);
  }

  function getStudentTaskGroups(rows: (typeof assignedTaskRowsByWeek)[AssignedTaskWeek]) {
    return rows.reduce<Array<{ recipient: string; rows: typeof rows }>>((groups, row) => {
      const group = groups.find((item) => item.recipient === row.recipient);
      if (group) {
        group.rows.push(row);
      } else {
        groups.push({ recipient: row.recipient, rows: [row] });
      }
      return groups;
    }, []);
  }

  function getAssignedTaskResourceType(taskType: string): ResourceType {
    return taskType === "Writing prompt" ? "Writing" : (taskType as ResourceType);
  }

  function getWeekTaskSummary(rows: (typeof assignedTaskRowsByWeek)[AssignedTaskWeek]) {
    const completed = rows.filter((row) => row.status === "Completed").length;
    const inProgress = rows.filter((row) => row.status === "In Progress").length;
    const notStarted = rows.filter((row) => row.status === "Not Started").length;
    return `${completed} completed | ${inProgress} in progress | ${notStarted} not started`;
  }

  function getWeekDateRange(rows: (typeof assignedTaskRowsByWeek)[AssignedTaskWeek]) {
    const days = rows.map((row) => row.sentAt.split(",")[0]);
    return `${days[0]} - ${days[days.length - 1]}`;
  }

  function renderTaskTable(rows: (typeof assignedTaskRowsByWeek)[AssignedTaskWeek]) {
    return (
      <div className="assigned-task-table" role="table" aria-label="Assigned task list">
        <div className="assigned-task-table-head" role="row">
          <span role="columnheader">Task</span>
          <span role="columnheader">Submitted</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Action</span>
        </div>
        {rows.map((row) => (
          <div className="assigned-task-table-row" role="row" key={row.id}>
            <strong className="assigned-task-name" role="cell">
              <TypeFilterIcon type={getAssignedTaskResourceType(row.taskType)} />
              <span>{row.taskName}</span>
            </strong>
            <span role="cell">{row.submittedAt}</span>
            <span role="cell">
              <Badge variant="secondary" className="assigned-task-status" data-status={row.status}>
                {row.status}
              </Badge>
            </span>
            <Button type="button" variant="outline" size="sm" className="assigned-task-feedback-button">
              Feedback
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card
      className="assigned-task-list-card"
      data-selected={isSelected}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <CardContent>
        {isSelected ? (
          <>
            <CardTitle>Task List</CardTitle>
            <div className="assigned-task-week-list">
              {weekItems.map((week) => {
                const rows = assignedTaskRowsByWeek[week.key];
                const isExpanded = expandedWeek === week.key;
                const studentGroups = getStudentTaskGroups(rows);

                return (
                  <section className="assigned-task-week-card" data-expanded={isExpanded} key={week.key}>
                    <button
                      type="button"
                      className="assigned-task-week-toggle"
                      aria-expanded={isExpanded}
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedWeek((current) => (current === week.key ? null : week.key));
                      }}
                    >
                      <span>
                        <strong>{week.title}</strong>
                        <em>{getWeekTaskSummary(rows)}</em>
                      </span>
                      <time>{getWeekDateRange(rows)}</time>
                      <ChevronRight size={18} />
                    </button>
                    {isExpanded && (
                      <div className="assigned-task-student-list">
                        {studentGroups.map((studentGroup) => {
                          const student = getTaskStudent(studentGroup.recipient);
                          const completedCount = studentGroup.rows.filter((row) => row.status === "Completed").length;
                          const isStudentExpanded = expandedStudentByWeek[week.key] === studentGroup.recipient;

                          return (
                            <section className="assigned-task-student-card" data-expanded={isStudentExpanded} key={studentGroup.recipient}>
                              <button
                                type="button"
                                className="assigned-task-student-toggle"
                                aria-expanded={isStudentExpanded}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setExpandedStudentByWeek((current) => ({
                                    ...current,
                                    [week.key]: current[week.key] === studentGroup.recipient ? null : studentGroup.recipient,
                                  }));
                                }}
                              >
                                <span className="assigned-task-student-avatar">
                                  {student?.avatarImage ? <img src={student.avatarImage} alt="" /> : getInitials(studentGroup.recipient)}
                                </span>
                                <span className="assigned-task-student-copy">
                                  <strong>{studentGroup.recipient}</strong>
                                  <em>
                                    {completedCount}/{studentGroup.rows.length} completed
                                  </em>
                                </span>
                                <ChevronRight size={16} />
                              </button>
                              {isStudentExpanded && renderTaskTable(studentGroup.rows)}
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        ) : (
          <div className="assigned-task-preview">
            <img src={`${import.meta.env.BASE_URL}myclass-icons/tasklist.png`} alt="" />
            <div className="assigned-task-summary-row">
              <AssignedTaskWeekSummary title="This Week" />
              <AssignedTaskWeekSummary title="Last Week" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type AssignWorkflowStep = 1 | 2 | 3;
type AssignContentType = "Reading" | "Video" | "Podcast" | "Writing prompt";
type AssignMultiSelectOption = "All" | string;

const assignContentOptions: Array<{ type: AssignContentType; label: string }> = [
  { type: "Reading", label: "Reading" },
  { type: "Video", label: "Video" },
  { type: "Podcast", label: "Podcast" },
  { type: "Writing prompt", label: "Writing prompt" },
];

const assignGenreOptions = [
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

const assignTopicOptions = ["All", "Science", "Chinese Arts", "Amphibians", "Social Studies"];

function AssignMultiSelect({
  label,
  options,
  values,
  open,
  onOpenChange,
  onChange,
  helper,
}: {
  label: string;
  options: string[];
  values: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (values: string[]) => void;
  helper?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onOpenChange, open]);

  function selectOption(option: AssignMultiSelectOption) {
    if (option === "All") {
      onChange(["All"]);
      return;
    }

    const current = values.includes("All") ? [] : values;
    const nextValues = current.includes(option)
      ? current.filter((value) => value !== option)
      : [...current, option];
    onChange(nextValues.length === 0 ? ["All"] : nextValues);
  }

  function removeOption(option: string) {
    onChange(values.filter((value) => value !== option));
  }

  return (
    <div className="assign-multi-select" data-open={open} ref={rootRef}>
      <button
        type="button"
        className="assign-multi-trigger"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
      >
        <span className="assign-required">*</span>
        <strong>{label}</strong>
        {helper && <em>{helper}</em>}
      </button>
      <div
        role="button"
        tabIndex={0}
        className="assign-multi-value"
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onOpenChange(!open);
          }
        }}
      >
        {values.length > 0 ? (
          values.map((value) => (
            <Badge key={value} variant="secondary" className="assign-multi-badge">
              <span>{value}</span>
              <span
                role="button"
                tabIndex={0}
                className="assign-multi-remove"
                aria-label={`Remove ${value}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeOption(value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    removeOption(value);
                  }
                }}
              >
                <X size={12} />
              </span>
            </Badge>
          ))
        ) : (
          <span className="assign-multi-placeholder">Select {label.toLowerCase()}</span>
        )}
      </div>
      {open && (
        <div className="assign-multi-menu">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              data-selected={values.includes(option)}
              onClick={(event) => {
                event.stopPropagation();
                selectOption(option);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AssignWorkflowPanel() {
  const [step, setStep] = useState<AssignWorkflowStep>(1);
  const [taskCounts, setTaskCounts] = useState<Record<AssignContentType, number>>({
    Reading: 0,
    Video: 0,
    Podcast: 0,
    "Writing prompt": 0,
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState(() => studentDirectory.slice(0, 8).map((student) => student.id));
  const [keyword, setKeyword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["All"]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["All"]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const selectedStudents = studentDirectory.filter((student) => selectedStudentIds.includes(student.id));
  const selectedTaskTypes = assignContentOptions.filter((item) => taskCounts[item.type] > 0).map((item) => item.type);
  const hasSelectedTaskType = selectedTaskTypes.length > 0;
  const hasSelectedStudents = selectedStudentIds.length > 0;
  const canGoNext = step === 1 ? hasSelectedTaskType : step === 2 ? hasSelectedStudents : true;
  const matchTaskTypes = selectedTaskTypes.length > 0 ? selectedTaskTypes : assignContentOptions.map((item) => item.type);
  function getAssignResourceType(taskType: AssignContentType): ResourceType {
    return taskType === "Writing prompt" ? "Writing" : taskType;
  }

  const matchedRows = selectedStudents.map((student, index) => {
    const taskType = matchTaskTypes[index % matchTaskTypes.length];
    const resourceType = getAssignResourceType(taskType);
    const matchingResources = resources.filter((item) => item.type === resourceType);
    const resource = matchingResources[index % matchingResources.length] ?? resources[(index + 1) % resources.length];
    return {
      student,
      resource,
      taskType,
      matchedLexile: Math.max(400, Math.min(1200, student.lexile + ((index % 3) - 1) * 30)),
    };
  });

  function getAssignMatchLength(row: (typeof matchedRows)[number]) {
    if (row.taskType === "Reading" && "wordCount" in row.resource) return `${row.resource.wordCount.toLocaleString()} words`;
    if ((row.taskType === "Video" || row.taskType === "Podcast") && "duration" in row.resource) return row.resource.duration;
    return "-";
  }

  function getAssignMatchTypeLabel(taskType: AssignContentType) {
    return taskType === "Writing prompt" ? "Writing" : taskType;
  }

  function toggleStudent(studentId: string) {
    setValidationMessage("");
    setSelectedStudentIds((current) =>
      current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId],
    );
  }

  function toggleAllStudents() {
    setValidationMessage("");
    setSelectedStudentIds((current) => (current.length === studentDirectory.length ? [] : studentDirectory.map((student) => student.id)));
  }

  function toggleContentType(type: AssignContentType) {
    setValidationMessage("");
    setTaskCounts((current) => ({
      ...current,
      [type]: current[type] > 0 ? 0 : 1,
    }));
  }

  function changeTaskCount(type: AssignContentType, delta: number) {
    setValidationMessage("");
    setTaskCounts((current) => ({
      ...current,
      [type]: current[type] === 0 && delta < 0 ? 0 : Math.max(1, Math.min(9, current[type] + delta)),
    }));
  }

  function getStepValidationMessage(targetStep?: AssignWorkflowStep) {
    if (targetStep) {
      if (targetStep > 1 && !hasSelectedTaskType) return "Select at least one content type.";
      if (targetStep > 2 && !hasSelectedStudents) return "Select at least one student.";
      return "";
    }

    if (step === 1 && !hasSelectedTaskType) return "Select at least one content type.";
    if (step === 2 && !hasSelectedStudents) return "Select at least one student.";
    return "";
  }

  function goToStep(nextStep: AssignWorkflowStep) {
    const message = getStepValidationMessage(nextStep);
    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    setStep(nextStep);
  }

  function goNext() {
    const message = getStepValidationMessage();
    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    setStep((current) => (current + 1) as AssignWorkflowStep);
  }

  return (
    <div className="assign-workflow">
      <div className="assign-stepper" aria-label="Assign steps">
        {[
          [1, "Task Info"],
          [2, "Students"],
          [3, "Confirm"],
        ].map(([itemStep, label]) => (
          <button
            key={itemStep}
            type="button"
            data-active={step === itemStep}
            aria-disabled={Boolean(getStepValidationMessage(itemStep as AssignWorkflowStep))}
            onClick={(event) => {
              event.stopPropagation();
              goToStep(itemStep as AssignWorkflowStep);
            }}
          >
            <span>{itemStep}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="assign-workflow-body">
        {step === 1 && (
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
                    data-type={getAssignResourceType(item.type)}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleContentType(item.type)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleContentType(item.type);
                      }
                    }}
                  >
                    <TypeFilterIcon type={getAssignResourceType(item.type)} />
                    <span>{getAssignMatchTypeLabel(item.type)}</span>
                    <div className="assign-content-count" aria-label={`${getAssignMatchTypeLabel(item.type)} quantity`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          changeTaskCount(item.type, -1);
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
                          changeTaskCount(item.type, 1);
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
              <AssignMultiSelect
                label="Genre"
                helper="Supports multiple selection"
                options={assignGenreOptions}
                values={selectedGenres}
                open={genreOpen}
                onOpenChange={(nextOpen) => {
                  setGenreOpen(nextOpen);
                  if (nextOpen) setTopicOpen(false);
                }}
                onChange={setSelectedGenres}
              />
              <AssignMultiSelect
                label="Topic"
                options={assignTopicOptions}
                values={selectedTopics}
                open={topicOpen}
                onOpenChange={(nextOpen) => {
                  setTopicOpen(nextOpen);
                  if (nextOpen) setGenreOpen(false);
                }}
                onChange={setSelectedTopics}
              />
              <label>
                <span>Key Words</span>
                <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Enter keywords" />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="assign-step-panel assign-student-picker">
            <div className="assign-student-chip-grid">
              <button
                type="button"
                className="assign-student-select-all"
                data-selected={selectedStudentIds.length === studentDirectory.length}
                onClick={toggleAllStudents}
              >
                <span className="assign-select-all-mark">All</span>
                <span>select all</span>
              </button>
              {studentDirectory.map((student) => {
                const selected = selectedStudentIds.includes(student.id);
                return (
                  <button key={student.id} type="button" data-selected={selected} onClick={() => toggleStudent(student.id)}>
                    <img src={student.avatarImage} alt="" />
                    <span>{student.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="assign-step-panel assign-match-review">
            <div className="assign-match-table">
              <div className="assign-match-head">
                <strong>Student</strong>
                <strong>Student/Task</strong>
                <strong>Type</strong>
                <strong>Content</strong>
                <strong>Length</strong>
                <strong>Genre</strong>
                <strong>Rematch</strong>
              </div>
              <div className="assign-match-body">
                {matchedRows.map((row) => (
                  <div className="assign-match-row" key={row.student.id}>
                    <span>{row.student.name}</span>
                    <span className="assign-match-lexile">{row.student.lexile}L/{row.matchedLexile}L</span>
                    <span className="assign-match-type">{getAssignMatchTypeLabel(row.taskType)}</span>
                    <span className="assign-match-title" title={row.resource.title}>{row.resource.title}</span>
                    <span className="assign-match-length">{getAssignMatchLength(row)}</span>
                    <span className="assign-match-genre" title={row.resource.genre}>{row.resource.genre}</span>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Rematch ${row.student.name}`}>
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="assign-workflow-footer">
        {validationMessage && <span className="assign-validation-message">{validationMessage}</span>}
        <Button type="button" variant="outline" disabled={step === 1} onClick={() => setStep((current) => (current - 1) as AssignWorkflowStep)}>
          Back
        </Button>
        {step < 3 ? (
          <Button type="button" aria-disabled={!canGoNext} data-disabled={!canGoNext} onClick={goNext}>
            Next
          </Button>
        ) : (
          <Button type="button">Assign</Button>
        )}
      </div>
    </div>
  );
}

type FeedbackQueueRow = {
  id: string;
  student: Student;
  task: Student["tasks"][number];
  submittedAt: string;
};

function FeedbackReviewDialog({ row, onClose }: { row: FeedbackQueueRow; onClose: () => void }) {
  const [taskCollapsed, setTaskCollapsed] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const quizQuestions = [
    {
      question: "Which of the following best summarizes the main idea of the passage?",
      selected: "C",
      correct: "C",
      options: [
        ["A", "Basketball's international popularity has surpassed that of American football."],
        ["B", "Basketball rules have remained unchanged since its invention."],
        ["C", "Basketball originated in the United States and evolved over time into a global sport with important historical milestones."],
        ["D", "The YMCA is no longer involved in basketball activities."],
      ],
    },
    {
      question: "Why was basketball first created as an indoor activity?",
      selected: "A",
      correct: "A",
      options: [
        ["A", "To keep students active during cold weather."],
        ["B", "To replace baseball in the summer."],
        ["C", "To prepare athletes for professional leagues."],
        ["D", "To teach students how to build gym equipment."],
      ],
    },
    {
      question: "What helped basketball become popular around the world?",
      selected: "D",
      correct: "B",
      options: [
        ["A", "The game stopped changing after the first rules were written."],
        ["B", "New rules, faster play, and wider media coverage helped the sport grow."],
        ["C", "Only one school was allowed to teach the game."],
        ["D", "The sport became slower and easier to broadcast."],
      ],
    },
    {
      question: "Which detail from the passage supports the idea that basketball changed over time?",
      selected: "B",
      correct: "B",
      options: [
        ["A", "Basketball was always played outdoors."],
        ["B", "New rules were added to make the game faster."],
        ["C", "The game was never shown in media."],
        ["D", "Students stopped playing the game after winter."],
      ],
    },
    {
      question: "What is the author's purpose in the passage?",
      selected: "A",
      correct: "A",
      options: [
        ["A", "To explain how basketball began and became a global sport."],
        ["B", "To argue that basketball should have fewer rules."],
        ["C", "To compare every major sport in the United States."],
        ["D", "To describe one famous basketball player."],
      ],
    },
    {
      question: "What should the student review next?",
      selected: "D",
      correct: "C",
      options: [
        ["A", "How to spell the names of basketball teams."],
        ["B", "How to calculate basketball scores."],
        ["C", "How rule changes solved specific problems in the sport."],
        ["D", "How fan-shaped backboards improved visibility."],
      ],
    },
  ];
  const activeQuestion = quizQuestions[activeQuestionIndex];
  const chatMessages = [
    {
      id: "m-1",
      text: `Nice work, ${row.student.name.split(" ")[0]}. You found the main idea and used details from the passage clearly.`,
      time: "2026-03-26 13:12",
    },
    {
      id: "m-2",
      text: "For the missed question, reread the sentence that explains what problem the rule change solved. Then connect the answer to that problem.",
      time: "2026-03-26 13:15",
    },
  ];

  return (
    <div className="feedback-backdrop" role="dialog" aria-modal="true" aria-label={`Feedback for ${row.student.name}`}>
      <Card className="feedback-review-dialog">
        <CardHeader>
          <div>
            <CardDescription>
              {row.student.name} · Submitted {row.submittedAt}
            </CardDescription>
            <CardTitle>{row.task.title}</CardTitle>
          </div>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close feedback" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="feedback-review-layout">
          <section className="feedback-review-left">
            <Card className="feedback-task-card" data-collapsed={taskCollapsed}>
              <CardContent>
                <button type="button" className="feedback-task-toggle" onClick={() => setTaskCollapsed((current) => !current)}>
                  <span>{row.task.title}</span>
                  <ChevronRight size={18} />
                </button>
                <div className="feedback-task-detail" aria-hidden={taskCollapsed}>
                  <div className="feedback-resource-meta">
                    <Badge variant="secondary">820L</Badge>
                    <Badge variant="outline">{row.task.resourceType}</Badge>
                    <Badge variant="outline">Informational Text</Badge>
                  </div>
                  <h3>History of Basketball</h3>
                  <p>
                    Basketball began as an indoor activity designed to keep students active during cold weather. Over time, the game
                    changed through new rules, faster play, and wider media coverage. These changes helped basketball grow from a local
                    gym class activity into a sport played and watched around the world.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="feedback-answer-card">
              <CardContent>
                <div className="feedback-quiz-tabs" aria-label="Quiz questions">
                  {quizQuestions.map((question, index) => (
                    <button
                      type="button"
                      key={question.question}
                      data-state={question.selected === question.correct ? "correct" : "missed"}
                      data-active={activeQuestionIndex === index}
                      onClick={() => setActiveQuestionIndex(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <h3>
                  <span>Question {activeQuestionIndex + 1}</span>
                  {activeQuestion.question}
                </h3>
                <div className="feedback-answer-list">
                  {activeQuestion.options.map(([letter, text]) => {
                    const isSelected = activeQuestion.selected === letter;
                    const isCorrect = activeQuestion.correct === letter;
                    return (
                      <div
                        className="feedback-answer-option"
                        data-selected={isSelected}
                        data-correct={isCorrect}
                        data-wrong={isSelected && !isCorrect}
                        key={letter}
                      >
                        <strong>{letter}</strong>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="feedback-review-right">
            <Card className="feedback-chat-card">
              <CardContent>
                <div className="feedback-chat-list">
                  {chatMessages.map((message) => (
                    <div className="feedback-chat-message" key={message.id}>
                      <span>{message.time}</span>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="feedback-input-card">
              <CardContent>
                <textarea placeholder="Write feedback to the student..." />
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="icon" aria-label="Record voice feedback">
                  <Mic size={18} />
                </Button>
                <Button>
                  <Send size={18} />
                  Send
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackQueuePanel({ onOpenFeedback }: { onOpenFeedback: (row: FeedbackQueueRow) => void }) {
  const feedbackRows = classes[0].students.flatMap((student, studentIndex) =>
    student.tasks
      .filter((task) => task.status === "In progress")
      .map((task, taskIndex) => ({
        id: `${student.id}-${task.id}`,
        student,
        task,
        submittedAt: `Today ${9 + ((studentIndex + taskIndex) % 7)}:${String((studentIndex * 11 + taskIndex * 17) % 60).padStart(2, "0")}`,
      })),
  );

  return (
    <div className="feedback-queue-panel">
      <div className="feedback-queue-head">
        <strong>In Progress Feedback</strong>
        <span>{feedbackRows.length} tasks</span>
      </div>

      {feedbackRows.length > 0 ? (
        <div className="feedback-queue-table">
          <div className="feedback-queue-table-head">
            <strong>Student</strong>
            <strong>Task</strong>
            <strong>Submitted</strong>
            <strong>Feedback</strong>
          </div>
          <div className="feedback-queue-table-body">
            {feedbackRows.map((row) => (
              <div className="feedback-queue-row" key={row.id}>
                <span>{row.student.name}</span>
                <span>{row.task.title}</span>
                <span>{row.submittedAt}</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenFeedback(row);
                  }}
                >
                  Feedback
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="feedback-empty-state">
          <strong>All feedback is complete</strong>
          <span>No in progress tasks are waiting for feedback.</span>
        </div>
      )}
    </div>
  );
}

function AssignedTaskSection({
  onOpenTaskStudent,
}: {
  onOpenTaskStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
}) {
  const [selectedAssignedPanel, setSelectedAssignedPanel] = useState<"assign" | "tasks">("assign");

  return (
    <section className="assigned-dashboard">
      <div className="assigned-overview-grid" aria-label="Assigned task overview">
        <div className="assigned-work-area" data-selected={selectedAssignedPanel}>
          <Card
            className="assign-hero-card assigned-overview-card task-mode-card"
            data-selected={selectedAssignedPanel === "assign"}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedAssignedPanel("assign")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedAssignedPanel("assign");
              }
            }}
          >
            <CardContent>
              {selectedAssignedPanel === "assign" ? (
                <AssignWorkflowPanel />
              ) : (
                <span className="task-mode-preview">
                  <img src={`${import.meta.env.BASE_URL}myclass-icons/assign.png`} alt="" />
                  <span data-tone="assign">ASSIGN<br />TASK</span>
                </span>
              )}
            </CardContent>
          </Card>

          <div className="assigned-task-list-area">
            <AssignedTaskListCard isSelected={selectedAssignedPanel === "tasks"} onSelect={() => setSelectedAssignedPanel("tasks")} />
          </div>
        </div>

        <div className="leaderboard-area">
          <LeaderboardCard onOpenStudent={onOpenTaskStudent} />
        </div>
      </div>
    </section>
  );
}

function LexileTrendChart({ studentName = "Aaliyah Johnson" }: { studentName?: string }) {
  const width = 720;
  const height = 320;
  const padding = { top: 34, right: 72, bottom: 46, left: 62 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const lexileToY = (value: number) => padding.top + chartHeight - ((value - 400) / 800) * chartHeight;
  const arToY = (value: number) => padding.top + chartHeight - ((value - 1) / 5) * chartHeight;
  const xFor = (index: number) => padding.left + (chartWidth / (lexileTrend.length - 1)) * index;
  const lexilePoints = lexileTrend.map((item, index) => `${xFor(index)},${lexileToY(item.lexile)}`).join(" ");
  const arPoints = lexileTrend.map((item, index) => `${xFor(index)},${arToY(item.ar)}`).join(" ");

  return (
    <Card className="lexile-trend-card">
      <CardHeader>
        <CardTitle>
          <ListChecks size={22} />
          Student Report Trend
        </CardTitle>
        <CardAction>
          <Select defaultValue={studentName}>
            <SelectTrigger className="lexile-student-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lexileLeaderboard.slice(0, 5).map(({ name }) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="lexile-chart-legend">
          <span data-tone="green">Lexile (L)</span>
          <span data-tone="purple">AR Level</span>
        </div>
        <svg className="lexile-trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Student report trend">
          <text x="10" y="24" className="chart-axis-title">
            Lexile (L)
          </text>
          <text x={width - 68} y="24" className="chart-axis-title">
            AR Level
          </text>
          {[400, 600, 800, 1000, 1200].map((tick) => {
            const y = lexileToY(tick);
            return (
              <g key={tick}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-grid-line" />
                <text x="24" y={y + 5} className="chart-tick">
                  {tick}
                </text>
              </g>
            );
          })}
          {[0, 1, 2, 3, 4, 5, 6].map((tick) => {
            const y = tick === 0 ? lexileToY(400) : arToY(tick);
            return (
              <text key={tick} x={width - 44} y={y + 5} className="chart-tick">
                {tick === 0 ? "0" : `${tick}.0`}
              </text>
            );
          })}
          <polyline points={lexilePoints} className="lexile-line" />
          <polyline points={arPoints} className="ar-line" />
          {lexileTrend.map((point, index) => {
            const x = xFor(index);
            return (
              <g key={point.label}>
                <circle cx={x} cy={lexileToY(point.lexile)} r="6" className="lexile-point" />
                <text x={x} y={lexileToY(point.lexile) - 14} textAnchor="middle" className="chart-value">
                  {point.lexile}L
                </text>
                <circle cx={x} cy={arToY(point.ar)} r="6" className="ar-point" />
                <text x={x} y={arToY(point.ar) + 28} textAnchor="middle" className="chart-value">
                  {point.ar}
                </text>
                <text x={x} y={height - 16} textAnchor="middle" className="chart-label">
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </CardContent>
    </Card>
  );
}

function LexileFocusCard({ student = lexileLeaderboard[3] }: { student?: (typeof lexileLeaderboard)[number] }) {
  return (
    <Card className="lexile-focus-card">
      <CardHeader>
        <CardTitle>
          <UsersRound size={22} />
          Student Focus
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Change student">
            <ChevronRight size={18} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Card className="focus-score-card">
          <CardContent>
            <div>
              <span>Current Lexile</span>
              <strong>{student.lexile}L</strong>
              <small>+{student.trend}L this term</small>
            </div>
            <div>
              <span>Current AR</span>
              <strong>{student.ar}</strong>
              <small>+0.6 this term</small>
            </div>
            <div>
              <span>Lexile Growth</span>
              <strong>+{student.trend}L</strong>
              <small>This semester</small>
            </div>
            <div>
              <span>Reading Accuracy</span>
              <strong>{student.accuracy}%</strong>
              <small>Latest average</small>
            </div>
          </CardContent>
        </Card>
        <div className="lexile-mode-row">
          <Button>Lexile</Button>
          <Button variant="outline">AR</Button>
          <Button variant="outline">Both</Button>
          <Select defaultValue="This Semester">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["This Semester", "This Month", "This Year"].map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentReportLineChart({
  label,
  unit,
  data,
  tone,
}: {
  label: string;
  unit: string;
  data: Array<{ label: string; value: number }>;
  tone: "green" | "amber" | "blue" | "purple";
}) {
  const width = 360;
  const height = 210;
  const padding = { top: 28, right: 24, bottom: 34, left: 46 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);
  const yMin = Math.max(0, Math.floor((minValue - range * 0.18) / 10) * 10);
  const yMax = Math.ceil((maxValue + range * 0.18) / 10) * 10;
  const yRange = Math.max(1, yMax - yMin);
  const xFor = (index: number) => padding.left + (chartWidth / (data.length - 1)) * index;
  const yFor = (value: number) => padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
  const points = data.map((item, index) => ({ ...item, x: xFor(index), y: yFor(item.value) }));
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const ticks = [yMin, Math.round((yMin + yMax) / 2), yMax];

  return (
    <div className="student-report-chart" data-tone={tone}>
      <div className="student-report-chart-head">
        <span>{label}</span>
        <em>{unit}</em>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} trend`}>
        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="student-report-grid-line" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="student-report-tick">
                {tick.toLocaleString()}
              </text>
            </g>
          );
        })}
        <polyline points={pointString} className="student-report-line" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4.5" className="student-report-point" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="student-report-value">
              {point.value.toLocaleString()}
            </text>
            <text x={point.x} y={height - 12} textAnchor="middle" className="student-report-label">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function LexileStatStrip() {
  const stats = [
    { label: "Class Avg. Lexile", value: "820L", detail: "+65L this term", icon: ListChecks, tone: "green" },
    { label: "Class Avg. AR", value: "4.2", detail: "+0.4 this term", icon: BookOpen, tone: "purple" },
    { label: "Highest Lexile", value: "1280L", detail: "Sophia Patel", icon: Trophy, tone: "amber" },
    { label: "Fastest Growth", value: "+190L", detail: "Ethan Kim", icon: CheckCircle2, tone: "blue" },
  ];

  return (
    <Card className="lexile-stat-strip">
      <CardContent>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} data-tone={stat.tone}>
              <span>
                <Icon size={32} />
              </span>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ClassDistributionContent({ title, data, xTitle }: { title: string; data: Array<{ label: string; value: number }>; xTitle: string }) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <>
      <div className="class-bar-chart" role="img" aria-label={title}>
        {data.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <i style={{ height: `${Math.max(10, (item.value / max) * 100)}%` }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <p className="class-bar-axis">{xTitle}</p>
    </>
  );
}

function LexileStudentDistributionChart() {
  const width = 640;
  const height = 270;
  const padding = { top: 18, right: 20, bottom: 34, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const minLexile = 300;
  const maxLexile = 1500;
  const expectedBand = { low: 900, high: 1110 };
  const students = studentDirectory.slice(0, 9).map((student, index) => ({
    name: student.name.split(" ")[0],
    lexile: student.lexile,
    x: padding.left + (plotWidth / 8) * index,
  }));
  const yFor = (value: number) => padding.top + plotHeight - ((value - minLexile) / (maxLexile - minLexile)) * plotHeight;
  const ticks = [300, 600, 900, 1200, 1500];

  return (
    <div className="lexile-student-distribution" role="img" aria-label="Current class student Lexile distribution">
      <svg viewBox={`0 0 ${width} ${height}`}>
        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="lexile-distribution-grid" />
              <text x={padding.left - 10} y={y + 5} textAnchor="end" className="lexile-distribution-tick">
                {tick.toLocaleString()}
              </text>
            </g>
          );
        })}

        <rect
          x={padding.left}
          y={yFor(expectedBand.high)}
          width={plotWidth}
          height={yFor(expectedBand.low) - yFor(expectedBand.high)}
          className="lexile-distribution-band"
        />

        {students.map((student, index) => {
          const y = yFor(student.lexile);
          const labelBelow = student.lexile >= 1120 || index % 3 === 0;
          const labelY = labelBelow ? y + 26 : y - 28;

          return (
            <g key={student.name} className="lexile-distribution-student">
              <circle cx={student.x} cy={y} r="9" />
              <text x={student.x} y={labelY} textAnchor="middle">
                <tspan x={student.x}>{student.name}</tspan>
                <tspan x={student.x} dy="15">
                  {student.lexile}L
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function ClassDistributionTabs() {
  const [activeTab, setActiveTab] = useState<"lexile" | "ar">("lexile");

  return (
    <Card className="class-distribution-card lexile-distribution-tabs" data-tone={activeTab === "ar" ? "purple" : "green"}>
      <CardHeader>
        <CardTitle>
          <ListChecks size={22} />
          Current Class Distribution
        </CardTitle>
        <CardAction>
          <div className="lexile-tab-control" role="tablist" aria-label="Distribution metric">
            <button type="button" role="tab" aria-selected={activeTab === "lexile"} onClick={() => setActiveTab("lexile")}>
              Lexile
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "ar"} onClick={() => setActiveTab("ar")}>
              AR
            </button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        {activeTab === "lexile" ? (
          <LexileStudentDistributionChart />
        ) : (
          <ClassDistributionContent title="Current Class AR Distribution" data={arClassDistribution} xTitle="AR Level (ATOS)" />
        )}
      </CardContent>
    </Card>
  );
}

function LexileLeaderboardCard({
  onOpenStudent,
}: {
  onOpenStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
}) {
  const [activeMetric, setActiveMetric] = useState<"lexile" | "ar">("lexile");

  return (
    <Card className="lexile-leaderboard-card">
      <CardHeader>
        <CardTitle>
          <Trophy size={22} />
          Report Leaderboard
        </CardTitle>
        <CardAction>
          <div className="lexile-tab-control" role="tablist" aria-label="Leaderboard metric">
            <button type="button" role="tab" aria-selected={activeMetric === "lexile"} onClick={() => setActiveMetric("lexile")}>
              Lexile
            </button>
            <button type="button" role="tab" aria-selected={activeMetric === "ar"} onClick={() => setActiveMetric("ar")}>
              AR
            </button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="lexile-leaderboard-head">
          <span>#</span>
          <span>Student</span>
          <span>{activeMetric === "lexile" ? "Lexile (L)" : "AR Level"}</span>
          <span>{activeMetric === "lexile" ? "Growth" : "AR Growth"}</span>
          <span />
        </div>
        {lexileLeaderboard.map((student) => (
          <div
            className="lexile-leaderboard-row"
            key={student.name}
            role="button"
            tabIndex={0}
            onClick={() => onOpenStudent(getStudentDetailFromReportStudent(student), "report")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenStudent(getStudentDetailFromReportStudent(student), "report");
              }
            }}
          >
            <Badge variant="secondary" className="rank-badge" data-rank={student.rank}>
              {student.rank}
            </Badge>
            <div className="leaderboard-student">
              <span className="leaderboard-avatar" style={student.avatarImage ? undefined : { backgroundColor: student.color }}>
                {student.avatarImage ? <img src={student.avatarImage} alt="" /> : student.avatar}
              </span>
              <strong>{student.name}</strong>
            </div>
            <span>{activeMetric === "lexile" ? `${student.lexile}L` : student.ar}</span>
            <em>{activeMetric === "lexile" ? `+${student.trend}L` : "+0.6"}</em>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="leaderboard-detail-button"
              aria-label={`View ${student.name} report details`}
              onClick={(event) => {
                event.stopPropagation();
                onOpenStudent(getStudentDetailFromReportStudent(student), "report");
              }}
            >
              <LeaderboardArrowIcon />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StudentReportPanel({ student }: { student: StudentDetailStudent }) {
  const [timeRange, setTimeRange] = useState<"week" | "month">("month");
  const monthLexileData = lexileTrend.map((item, index) => ({
    label: item.label,
    value: index === lexileTrend.length - 1 ? student.lexile : item.lexile,
  }));
  const weekLexileData = [
    { label: "Mon", value: Math.max(400, student.lexile - 42) },
    { label: "Tue", value: Math.max(400, student.lexile - 36) },
    { label: "Wed", value: Math.max(400, student.lexile - 22) },
    { label: "Thu", value: Math.max(400, student.lexile - 18) },
    { label: "Fri", value: Math.max(400, student.lexile - 8) },
    { label: "Sun", value: student.lexile },
  ];
  const reportData = {
    month: {
      lexile: monthLexileData,
      readingTime: [
        { label: "Jan", value: 82 },
        { label: "Feb", value: 96 },
        { label: "Mar", value: 104 },
        { label: "Apr", value: 118 },
        { label: "May", value: 126 },
        { label: "Jun", value: 142 },
      ],
      readingWords: [
        { label: "Jan", value: 8200 },
        { label: "Feb", value: 9600 },
        { label: "Mar", value: 10800 },
        { label: "Apr", value: 12300 },
        { label: "May", value: 13700 },
        { label: "Jun", value: 15100 },
      ],
      writingWords: [
        { label: "Jan", value: 960 },
        { label: "Feb", value: 1180 },
        { label: "Mar", value: 1340 },
        { label: "Apr", value: 1510 },
        { label: "May", value: 1680 },
        { label: "Jun", value: 1890 },
      ],
    },
    week: {
      lexile: weekLexileData,
      readingTime: [
        { label: "Mon", value: 18 },
        { label: "Tue", value: 22 },
        { label: "Wed", value: 20 },
        { label: "Thu", value: 26 },
        { label: "Fri", value: 24 },
        { label: "Sun", value: 32 },
      ],
      readingWords: [
        { label: "Mon", value: 1380 },
        { label: "Tue", value: 1640 },
        { label: "Wed", value: 1510 },
        { label: "Thu", value: 1880 },
        { label: "Fri", value: 1760 },
        { label: "Sun", value: 2140 },
      ],
      writingWords: [
        { label: "Mon", value: 180 },
        { label: "Tue", value: 220 },
        { label: "Wed", value: 205 },
        { label: "Thu", value: 260 },
        { label: "Fri", value: 240 },
        { label: "Sun", value: 300 },
      ],
    },
  };
  const activeData = reportData[timeRange];

  return (
    <div className="student-report-panel">
      <div className="student-report-range" role="tablist" aria-label="Report time range">
        <button type="button" role="tab" aria-selected={timeRange === "week"} onClick={() => setTimeRange("week")}>
          Week
        </button>
        <button type="button" role="tab" aria-selected={timeRange === "month"} onClick={() => setTimeRange("month")}>
          Month
        </button>
      </div>
      <StudentReportLineChart label="Lexile" unit="L" data={activeData.lexile} tone="green" />
      <StudentReportLineChart label="Reading Time" unit="min" data={activeData.readingTime} tone="amber" />
      <StudentReportLineChart label="Reading Words" unit="words" data={activeData.readingWords} tone="blue" />
      <StudentReportLineChart label="Writing Words" unit="words" data={activeData.writingWords} tone="purple" />
    </div>
  );
}

function StudentDetailDialog({
  student,
  initialTab,
  onClose,
}: {
  student: StudentDetailStudent;
  initialTab: StudentDetailTab;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<StudentDetailTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, student.name]);

  return (
    <div className="feedback-backdrop" role="dialog" aria-modal="true" aria-label={`${student.name} details`}>
      <Card className="student-detail-dialog">
        <CardHeader>
          <div className="student-task-dialog-title">
            <span className="leaderboard-avatar" style={student.avatarImage ? undefined : { backgroundColor: student.color }}>
              {student.avatarImage ? <img src={student.avatarImage} alt="" /> : student.avatar}
            </span>
            <div>
              <CardDescription>{student.readingLevel}L reading level</CardDescription>
              <CardTitle>{student.name}</CardTitle>
            </div>
          </div>
          <div className="student-detail-tabs" role="tablist" aria-label={`${student.name} detail sections`}>
            <button type="button" role="tab" aria-selected={activeTab === "tasks"} onClick={() => setActiveTab("tasks")}>
              <img src={`${import.meta.env.BASE_URL}myclass-icons/assigned-tasks.png`} alt="" />
              Tasks
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "report"} onClick={() => setActiveTab("report")}>
              <img src={`${import.meta.env.BASE_URL}myclass-icons/lexile-ar.png`} alt="" />
              Report
            </button>
          </div>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close student details" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="student-detail-dialog-content">
          {activeTab === "tasks" ? <StudentTasksPanel student={student} /> : <StudentReportPanel student={student} />}
        </CardContent>
      </Card>
    </div>
  );
}

function LexileArSection({
  onOpenStudent,
}: {
  onOpenStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
}) {
  return (
    <section className="lexile-dashboard">
      <div className="lexile-leaderboard-area">
        <LexileLeaderboardCard onOpenStudent={onOpenStudent} />
      </div>
      <div className="lexile-distribution-area">
        <ClassDistributionTabs />
      </div>
      <div className="lexile-empty-area" aria-hidden="true" />
    </section>
  );
}

function ClassView() {
  const [activeSection, setActiveSection] = useState<MyClassSection>("assigned");
  const [students, setStudents] = useState<StudentDirectoryEntry[]>(studentDirectory);
  const [activeStudentDetail, setActiveStudentDetail] = useState<StudentDetailStudent | null>(null);
  const [activeStudentDetailTab, setActiveStudentDetailTab] = useState<StudentDetailTab>("tasks");

  function updateStudentLexileAr(studentId: string, values: Pick<StudentDirectoryEntry, "lexile" | "ar">) {
    setStudents((currentStudents) =>
      currentStudents.map((student) => (student.id === studentId ? { ...student, ...values } : student)),
    );
  }

  function viewStudentDetail(student: StudentDirectoryEntry) {
    setActiveStudentDetail(getStudentDetailFromDirectory(student));
    setActiveStudentDetailTab("tasks");
  }

  function openStudentDetail(student: StudentDetailStudent, tab: StudentDetailTab = "tasks") {
    setActiveStudentDetail(student);
    setActiveStudentDetailTab(tab);
  }

  return (
    <main className="workspace myclass-workspace">
      <section className="myclass-summary-grid" aria-label="MyClass sections">
        {myClassSections.map((section) => (
          <MyClassSummaryCard
            key={section.key}
            section={section}
            isActive={activeSection === section.key}
            onSelect={() => setActiveSection(section.key)}
          />
        ))}
      </section>

      {activeSection === "students" && (
        <StudentSection
          students={students}
          onUpdateStudent={updateStudentLexileAr}
          onViewDetail={viewStudentDetail}
        />
      )}
      {activeSection === "assigned" && (
        <AssignedTaskSection
          onOpenTaskStudent={openStudentDetail}
        />
      )}
      {activeSection === "lexile" && <LexileArSection onOpenStudent={openStudentDetail} />}
      {activeStudentDetail && (
        <StudentDetailDialog
          student={activeStudentDetail}
          initialTab={activeStudentDetailTab}
          onClose={() => setActiveStudentDetail(null)}
        />
      )}
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
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(false);
  const [topClassName, setTopClassName] = useState(classes[0]?.name ?? "");
  const [classSwitcherOpen, setClassSwitcherOpen] = useState(false);
  const classSwitcherRef = useRef<HTMLDivElement | null>(null);
  const teacherMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!classSwitcherOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!classSwitcherRef.current?.contains(event.target as Node)) {
        setClassSwitcherOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [classSwitcherOpen]);

  useEffect(() => {
    if (activeView !== "myclass") {
      setClassSwitcherOpen(false);
    }
  }, [activeView]);

  useEffect(() => {
    if (!teacherMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!teacherMenuRef.current?.contains(event.target as Node)) {
        setTeacherMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [teacherMenuOpen]);

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
          {activeView === "myclass" && (
            <div className="top-class-switcher" ref={classSwitcherRef} data-open={classSwitcherOpen}>
              <button
                type="button"
                className="top-class-switcher-icon-button"
                aria-label="Switch class"
                aria-expanded={classSwitcherOpen}
                onClick={() => setClassSwitcherOpen((open) => !open)}
              >
                <span className="top-class-switcher-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.57996 5.15991H17.42C19.08 5.15991 20.42 6.49991 20.42 8.15991V11.4799" stroke="#171717" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.73996 2L3.57996 5.15997L6.73996 8.32001" stroke="#171717" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20.42 18.84H6.57996C4.91996 18.84 3.57996 17.5 3.57996 15.84V12.52" stroke="#171717" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17.26 21.9999L20.42 18.84L17.26 15.6799" stroke="#171717" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              <span className="top-class-switcher-copy">
                <span>current class:</span>
                <strong>{topClassName}</strong>
              </span>
              {classSwitcherOpen && (
                <div className="top-class-switcher-menu" role="listbox" aria-label="Class options">
                  {classes.map((classRoom) => (
                    <button
                      key={classRoom.id}
                      type="button"
                      className="top-class-switcher-option"
                      data-active={classRoom.name === topClassName}
                      role="option"
                      aria-selected={classRoom.name === topClassName}
                      onClick={() => setTopClassName(classRoom.name)}
                    >
                      {classRoom.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="teacher-profile-menu" ref={teacherMenuRef}>
            <div className="teacher-profile-anchor">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="teacher-avatar-button"
                aria-label="Teacher profile"
                aria-haspopup="menu"
                aria-expanded={teacherMenuOpen}
                onClick={() => setTeacherMenuOpen((isOpen) => !isOpen)}
              >
                <img src={studentAvatarImages[9]} alt="Teacher avatar" />
              </Button>
              <span>Ms. Charlotte Bennett</span>
            </div>
            {teacherMenuOpen && (
              <Card className="teacher-menu-popover" role="menu">
                <CardContent>
                  <Button variant="ghost" role="menuitem" onClick={() => setTeacherMenuOpen(false)}>
                    <LogOut size={18} />
                    Log out
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {activeView === "library" ? <LibraryView /> : <ClassView />}
      </section>
    </div>
  );
}

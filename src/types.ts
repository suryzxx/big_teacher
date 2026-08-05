export type ResourceType = "Writing" | "Podcast" | "Video" | "Reading";
export type ResourceGenre =
  | "Fiction"
  | "Short Story"
  | "Informational Text"
  | "Biography"
  | "Opinion"
  | "Science Fiction"
  | "News"
  | "Fantasy"
  | "Informative"
  | "Persuasive"
  | "Descriptive"
  | "Narrative"
  | "Report"
  | "poetry"
  | "Story"
  | "Blog Post"
  | "Email"
  | "Letter";

type BaseResource = {
  id: string;
  title: string;
  type: ResourceType;
  genre: ResourceGenre;
  topic: string;
  lexile: number;
  coverImage: string;
  description: string;
  tags: string[];
};

export type TextResource = BaseResource & {
  type: "Writing" | "Reading";
  wordCount: number;
};

export type MediaResource = BaseResource & {
  type: "Podcast" | "Video";
  duration: string;
};

export type Resource = TextResource | MediaResource;

export type TaskStatus = "Not started" | "In progress" | "Submitted" | "Needs help" | "Completed";

export type StudentTask = {
  id: string;
  title: string;
  resourceType: ResourceType;
  dueDate: string;
  score: number | null;
  progress: number;
  status: TaskStatus;
};

export type Student = {
  id: string;
  name: string;
  avatarColor: string;
  avatarImage?: string;
  readingLevel: number;
  weeklyMinutes: number;
  completionRate: number;
  risk: "Low" | "Medium" | "High";
  tasks: StudentTask[];
};

export type ClassRoom = {
  id: string;
  name: string;
  grade: string;
  schedule: string;
  activeUnit: string;
  students: Student[];
};

export type MyClassSummaryCardData<Key extends string = string> = {
  key: Key;
  title: string;
  primary: string;
  secondary: string;
  detail: string;
  iconImage: string;
  tone: "green" | "purple" | "amber" | "blue" | "pink";
};

export type AssignedTaskStatus = "Completed" | "In Progress" | "Not Started";

export type AssignedTaskRow = {
  id: number;
  studentId?: string;
  taskName: string;
  recipient: string;
  taskType: string;
  sentAtDate: string;
  sentAt: string;
  submittedAt: string;
  status: AssignedTaskStatus;
  completedAt: string;
};

export type AssignedTaskBatch = {
  key: string;
  title: string;
  sentAt: string;
  sentAtDate: string;
  rows: AssignedTaskRow[];
};

export type FeedbackQuestion = {
  id: number;
  question: string;
  options: ReadonlyArray<readonly [string, string]>;
  correct: string;
  selected: string;
};

export type FeedbackMessage = {
  id: string;
  time: string;
  text: string;
};

export type FeedbackContent = {
  questions: FeedbackQuestion[];
  messages: FeedbackMessage[];
};

export type AssignedCompletionDetail =
  | { kind: "Reading"; label: string; totalQuestions: number; correctAnswers: number }
  | { kind: "Writing"; label: string; score: number; wordCount: number; versions: number };

export type AssignStatsPeriod = "week" | "month" | "year";

export type StudentDirectoryStatus = "ok" | "watch" | "support";

export type StudentDirectoryEntry = {
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

export type ReportTimeRange = "week" | "month" | "semester";

export type StudentDetailTab = "tasks" | "report";

export type ReportTrendPoint = { label: string; value: number };

export type StudentReadingReportData = {
  lexile: ReportTrendPoint[];
  readingTime: ReportTrendPoint[];
  readingWords: ReportTrendPoint[];
  writingTime: ReportTrendPoint[];
  writingWords: ReportTrendPoint[];
};

export type CompletionLeaderboardStudent = {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  avatarImage?: string;
  readingLevel: number;
  tasks: StudentTask[];
  completed: number;
  inProgress: number;
  notStarted: number;
  done: number;
  total: number;
  rate: number;
  color: string;
};

export type LexileLeaderboardStudent = {
  rank: number;
  name: string;
  lexile: number;
  ar: number;
  trend: number;
  accuracy: number;
  avatar: string;
  avatarImage?: string;
  color: string;
  id: string;
};

export type StudentDetailStudent = CompletionLeaderboardStudent & {
  id: string;
  lexile: number;
  ar: number;
  trend: number;
  accuracy: number;
};

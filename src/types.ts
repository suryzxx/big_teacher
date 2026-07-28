export type ResourceType = "E-book" | "Audio" | "Video" | "Reading";
export type ResourceGenre =
  | "Fiction"
  | "Short Story"
  | "Informational Text"
  | "Biography"
  | "Opinion"
  | "Science Fiction"
  | "News"
  | "Fantasy";

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
  type: "E-book" | "Reading";
  wordCount: number;
};

export type MediaResource = BaseResource & {
  type: "Audio" | "Video";
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

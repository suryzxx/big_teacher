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
  grades?: string;
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

export type ResourceListQuery = {
  page: number;
  page_size: number;
  /** 阅读列表：标题/正文模糊搜索 */
  content?: string;
  /** 音视频列表：标题模糊搜索 */
  title?: string;
  topic?: string;
  /** 学科/体裁（对应 reading 的 subject、音视频的 category） */
  subject?: string;
  /** 阅读：词数区间 */
  min_wordcount?: number;
  max_wordcount?: number;
  /** 蓝思区间（后端字段为 string 类型） */
  min_lx?: string;
  max_lx?: string;
  lx_type?: string;
  resource_type?: string;
  /** 音视频：时长区间（秒） */
  min_time_length?: number;
  max_time_length?: number;
};

export type ReadingResource = {
  id: number;
  brain_id: string;
  title: string;
  lexile: string;
  lexile_num: number;
  grade: string;
  hash_id: string;
  topic_id: number;
  uid: number;
  chat_id: string;
  content: string;
  quiz: number;
  img: string;
  topic: string;
  subject: string;
  wordcount: number;
  created_at?: string;
  updated_at?: string;
};

export type ReadingDetailArticle = {
  id: number;
  hash_id: string;
  title: string;
  content: string;
  img?: string;
  lexile?: string;
  lexile_num?: number;
  grade?: string;
  subject?: string;
  topic?: string;
};

export type ReadingVocabularyItem = {
  id: number;
  hash_id: string;
  word: string;
  pos: string;
  definition: string;
  ctx: string;
  synonyms: string;
  antonyms: string;
};

export type ReadingQuizItem = {
  id: number;
  article_hash_id: string;
  question: string;
  options: string;
  answer: string;
  no: number;
  explanation: string;
};

export type MediaQuizItem = {
  id: number;
  question: string;
  options: string;
  answer: string;
  no: number;
  explanation: string;
};

export type AudioDetail = {
  id: number;
  hash_id: string;
  title: string;
  path: string;
  cover: string;
  time_length: number;
  category?: string;
  lexile_num?: number;
  topic?: string;
  quiz?: MediaQuizItem[];
};

export type VideoDetail = {
  id: number;
  hash_id: string;
  title: string;
  path: string;
  cover: string;
  thumbnail?: string;
  cover_img?: string;
  time_length: number;
  category?: string;
  lexile_num?: number;
  topic?: string;
  quiz?: MediaQuizItem[];
};

export type ReadingDetailResult = {
  article_info: ReadingDetailArticle;
  quiz_info: ReadingQuizItem[];
  vocabulary: ReadingVocabularyItem[];
};

export type AudioResource = {
  id: number;
  hash_id: string;
  cover: string;
  path: string;
  title: string;
  grade: string | null;
  file_name: string;
  time_length: number;
  folder_id?: string;
  in_reading_path?: number;
  category?: string;
  lexile_num?: number;
  topic?: string;
  detailed_script?: string;
  created_at?: string;
  updated_at?: string;
};

export type VideoResource = {
  id: number;
  hash_id: string;
  path: string;
  title: string;
  grade: string | null;
  asr: string | null;
  summary: string | null;
  file_name: string;
  time_length: number;
  cover: string;
  folder_id?: string;
  in_reading_path?: number;
  category?: string;
  lexile_num?: number;
  detailed_script?: string;
  transcript?: string;
  topic?: string;
  created_at?: string;
  updated_at?: string;
};

export type WritingTask = {
  id: number;
  task_id: string;
  name: string;
  content: string;
  imgs: string | null;
  avatar: string;
  grades: string;
  genre: string;
  created_by: number;
  tags: string;
  recommended: number;
  folder_id: string;
  category: number;
  b_teacher_id: number;
  created_at: string;
  updated_at: string;
};

export type ResourceListResult<T> = {
  total: number;
  list: T[];
};

export type WritingTaskListParams = {
  page: number;
  category?: number;
  folder_id?: string;
  keyword?: string;
  genre?: string;
};

export type WritingTaskCreateParams = {
  name: string;
  content: string;
  avatar?: string;
  imgs?: string | null;
  grades?: string;
  genre?: string;
  tags?: string;
  recommended?: number;
  folder_id?: string;
  created_by?: number;
  category?: number;
};

export type WritingTaskUpdateParams = WritingTaskCreateParams & {
  task_id: string;
};

// 写作任务弹窗表单草稿（创建/编辑共用）：
// avatarFile 为本地新选的图片，提交时先上传再写入 avatar；
// 编辑时 existingAvatar / existingImgs 用于保留原图。
export type WritingTaskFormDraft = {
  task_id?: string;
  name: string;
  content: string;
  grades: string;
  genre: string;
  recommended: number;
  folder_id: string;
  category: number;
  avatarFile?: File;
  existingAvatar?: string;
  existingImgs?: string | null;
};

export type TeacherProfile = {
  id: number;
  account: string;
  name: string;
  qrcode?: string;
  avatar?: string;
  role_name?: string;
  status?: number;
  token: string;
  created_at?: string;
  updated_at?: string;
};

export type ConstantsOption = {
  value: string;
  label: string;
  data?: string | null;
};

export type ConstantsData = {
  topic: ConstantsOption[];
};

export type AssignClass = {
  id: number;
  name: string;
  student_num?: number;
};

export type AssignStudent = {
  id: number;
  uid: number;
  class_id: number;
  student_info: {
    uid: number;
    name: string;
    avatar?: string;
    grade?: string;
  };
};

export type AssignPayloadItem = {
  uid: number;
  class_id: number;
  resource_id: string;
  resource_type: string;
};

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

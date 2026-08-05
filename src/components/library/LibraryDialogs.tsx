import { useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuItem } from "@/components/shared/DropdownMenu";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { useClickOutside } from "@/lib/useClickOutside";
import type {
  AssignClass,
  AssignStudent,
  Resource,
  ResourceGenre,
  WritingTask,
  WritingTaskFormDraft,
} from "@/types";

const GRADE_TO_NUMBER: Record<string, string> = {
  "1st Grade": "1",
  "2nd Grade": "2",
  "3rd Grade": "3",
  "4th Grade": "4",
  "5th Grade": "5",
  "6th Grade": "6",
};

const NUMBER_TO_GRADE: Record<string, string> = {
  "1": "1st Grade",
  "2": "2nd Grade",
  "3": "3rd Grade",
  "4": "4th Grade",
  "5": "5th Grade",
  "6": "6th Grade",
};

// 详情接口的 grades 可能是数字（"2,3,4"）也可能是文案（"1st Grade,2nd Grade"），
// 统一转成下拉选项用的年级文案。
function parseGrades(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => NUMBER_TO_GRADE[item] ?? item);
}

export function CreateWritingDialog({
  task,
  onClose,
  onSubmit,
  submitting = false,
  error = null,
}: {
  task?: WritingTask | null;
  onClose: () => void;
  onSubmit: (draft: WritingTaskFormDraft) => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const isEditing = Boolean(task);
  const gradeOptions = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade"];
  const genreOptions: ResourceGenre[] = [
    "Informative",
    "Persuasive",
    "Descriptive",
    "Narrative",
    "Report",
    "poetry",
    "Story",
    "Blog Post",
    "Email",
    "Letter",
  ];
  const [title, setTitle] = useState(task?.name ?? "");
  const [prompt, setPrompt] = useState(task?.content ?? "");
  const [grades, setGrades] = useState<string[]>(task ? parseGrades(task.grades) : []);
  const [genre, setGenre] = useState<ResourceGenre | "">((task?.genre as ResourceGenre) ?? "");
  // 接口文档：recommended 默认 1（推荐），开关默认开启
  const [recommended, setRecommended] = useState(task ? task.recommended === 1 : true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [gradeMenuOpen, setGradeMenuOpen] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const genreMenuRef = useRef<HTMLDivElement | null>(null);
  const existingAvatar = isEditing && task?.avatar ? task.avatar : undefined;

  useClickOutside(genreMenuRef, genreMenuOpen, () => setGenreMenuOpen(false));

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setAvatarRemoved(false);
  }

  function removeImage() {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview("");
    setAvatarRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function submitWriting() {
    const trimmedTitle = title.trim();
    const trimmedPrompt = prompt.trim();
    if (!trimmedTitle || !trimmedPrompt || grades.length === 0 || !genre) return;

    onSubmit({
      task_id: task?.task_id,
      name: trimmedTitle,
      content: trimmedPrompt,
      grades: grades.map((grade) => GRADE_TO_NUMBER[grade] ?? grade).join(","),
      genre,
      recommended: recommended ? 1 : 0,
      folder_id: "default",
      // 本系统写死 B 端：category = 1（服务端自动写入当前教师）
      category: 1,
      avatarFile: coverFile ?? undefined,
      existingAvatar: avatarRemoved ? undefined : existingAvatar,
      existingImgs: task?.imgs ?? null,
    });
  }

  return (
    <div
      className="writing-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Edit Writing Task" : "Create Writing Prompt"}
    >
      <Card className="writing-create-dialog">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Writing Task" : "Create Writing Prompt"}</CardTitle>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close writing dialog" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="writing-create-form">
          <div className="writing-create-main">
            <label className="writing-field writing-field-full">
              <span>
                <em>*</em> Writing Title
              </span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>

            <label className="writing-field writing-field-full">
              <span>
                <em>*</em> Writing Prompt
              </span>
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            </label>
          </div>

          <aside className="writing-create-side">
            <div className="writing-field">
              <MultiSelect
                label="Grade"
                options={gradeOptions}
                values={grades}
                open={gradeMenuOpen}
                required
                allOption={undefined}
                onOpenChange={(nextOpen) => {
                  setGradeMenuOpen(nextOpen);
                  if (nextOpen) setGenreMenuOpen(false);
                }}
                onChange={setGrades}
              />
            </div>

            <div className="writing-field writing-picker" data-open={genreMenuOpen} ref={genreMenuRef}>
              <span>
                <em>*</em> Category
              </span>
              <button
                type="button"
                className="writing-select-shell"
                aria-expanded={genreMenuOpen}
                onClick={() => {
                  setGenreMenuOpen((current) => !current);
                  setGradeMenuOpen(false);
                }}
              >
                {genre ? <strong>{genre}</strong> : <span className="writing-select-placeholder">Select category</span>}
                <ChevronDown size={18} />
              </button>
              {genreMenuOpen && (
                <DropdownMenu width="full" scroll>
                  {genreOptions.map((item) => (
                    <DropdownMenuItem
                      key={item}
                      selected={genre === item}
                      onSelect={() => {
                        setGenre(item);
                        setGenreMenuOpen(false);
                      }}
                    >
                      <span>{item}</span>
                      {genre === item && <CheckCircle2 size={16} />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
              )}
            </div>

            <div className="writing-recommend">
              <span>Recommended</span>
              <button type="button" className="writing-switch" data-enabled={recommended} aria-pressed={recommended} onClick={() => setRecommended((current) => !current)}>
                <span />
              </button>
            </div>

            <div className="writing-image-section">
              <span>Related Image</span>
              <div className="writing-image-list">
                {(coverPreview || (existingAvatar && !avatarRemoved)) && (
                  <div className="writing-image-preview">
                    <img src={coverPreview || resolveMediaUrl(existingAvatar)} alt="" />
                    <button type="button" className="writing-image-remove" aria-label="Remove image" onClick={removeImage}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                <label className="writing-upload-card">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} />
                  <span>+</span>
                  <strong>Upload Image</strong>
                </label>
              </div>
            </div>

          </aside>
        </CardContent>
        <CardFooter className="writing-create-footer">
          {error && <p className="writing-create-error">{error}</p>}
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button disabled={submitting || !title.trim() || !prompt.trim() || grades.length === 0 || !genre} onClick={submitWriting}>
            {submitting ? (isEditing ? "Saving…" : "Creating…") : isEditing ? "Save" : "Create"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function AssignResourceDialog({
  resource,
  classes,
  students,
  studentsLoading,
  classLoading = false,
  error = null,
  submitting = false,
  selectedClassId,
  selectedStudentIds,
  onClassChange,
  onStudentToggle,
  onStudentSelectAll,
  onClose,
  onAssign,
}: {
  resource: Resource;
  classes: AssignClass[];
  students: AssignStudent[];
  studentsLoading: boolean;
  classLoading?: boolean;
  error?: string | null;
  submitting?: boolean;
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
  const selectedClass = classes.find((classRoom) => String(classRoom.id) === selectedClassId) ?? null;
  const resourceDetail = "wordCount" in resource ? `${resource.wordCount.toLocaleString()} words` : resource.duration;
  const allStudentIds = students.map((student) => String(student.uid));
  const allStudentsSelected = allStudentIds.length > 0 && allStudentIds.every((studentId) => selectedStudentIds.includes(studentId));

  useClickOutside(classMenuRef, classMenuOpen, () => setClassMenuOpen(false));

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
                <span>{classLoading ? "加载中…" : selectedClass?.name ?? "Select class"}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
              {classMenuOpen && (
                <DropdownMenu width="full" role="listbox" label="Class options">
                  {classes.map((classRoom) => (
                    <DropdownMenuItem
                      key={classRoom.id}
                      selected={String(classRoom.id) === selectedClassId}
                      role="option"
                      aria-selected={String(classRoom.id) === selectedClassId}
                      onSelect={() => {
                        onClassChange(String(classRoom.id));
                        setClassMenuOpen(false);
                      }}
                    >
                      {classRoom.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
              )}
            </div>
          </section>

          <section className="assign-section assign-students-section" data-ready={Boolean(selectedClass)}>
            <div>
              <h3>choose students</h3>
            </div>
            {selectedClass ? (
              studentsLoading ? (
                <p className="assign-students-hint">加载中…</p>
              ) : students.length === 0 ? (
                <p className="assign-students-hint">该班级暂无学生</p>
              ) : (
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
                      <small>{students.length} students</small>
                    </span>
                  </button>
                  {students.map((student) => {
                    const studentId = String(student.uid);
                    const isSelected = selectedStudentIds.includes(studentId);
                    const avatar = student.student_info.avatar ? resolveMediaUrl(student.student_info.avatar) : undefined;
                    const name = student.student_info.name || `Student ${student.uid}`;
                    const initials = name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2);
                    return (
                      <button
                        key={studentId}
                        type="button"
                        className="assign-student-card"
                        data-selected={isSelected}
                        aria-pressed={isSelected}
                        onClick={() => onStudentToggle(studentId)}
                      >
                        <span className="avatar">{avatar ? <img src={avatar} alt="" /> : initials}</span>
                        <span>
                          <span>{name}</span>
                          <small>{student.student_info.grade ? `Grade ${student.student_info.grade}` : String(student.uid)}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="assign-student-grid assign-student-grid-placeholder" aria-hidden="true">
                {Array.from({ length: 9 }, (_, index) => (
                  <span className="assign-student-card assign-student-placeholder-card" key={index} />
                ))}
              </div>
            )}
            {error && <p className="assign-error">{error}</p>}
          </section>
        </CardContent>

        <CardFooter className="assign-dialog-footer">
          <Badge variant="secondary">{selectedStudentIds.length} selected</Badge>
          <div>
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button disabled={submitting || !selectedClass || selectedStudentIds.length === 0} onClick={onAssign}>
              {submitting ? "Assigning…" : "Assign"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createWritingResourceId } from "@/lib/resourceDrafts";
import { useClickOutside } from "@/lib/useClickOutside";
import type { ClassRoom, Resource, ResourceGenre } from "@/types";

export function CreateWritingDialog({
  resource,
  onClose,
  onSave,
}: {
  resource?: Resource | null;
  onClose: () => void;
  onSave: (resource: Resource) => void;
}) {
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
  const isEditing = Boolean(resource);
  const [title, setTitle] = useState(resource?.title ?? "");
  const [prompt, setPrompt] = useState(resource?.description ?? "");
  const [grades, setGrades] = useState(resource?.topic ? resource.topic.split(", ").filter(Boolean) : []);
  const [genre, setGenre] = useState<ResourceGenre | "">(resource?.genre ?? "");
  const [recommended, setRecommended] = useState(resource?.tags.includes("recommended") ?? false);
  const [coverImage, setCoverImage] = useState(resource?.coverImage ?? "");
  const [gradeMenuOpen, setGradeMenuOpen] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const gradeMenuRef = useRef<HTMLDivElement | null>(null);
  const genreMenuRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(gradeMenuRef, gradeMenuOpen, () => setGradeMenuOpen(false));
  useClickOutside(genreMenuRef, genreMenuOpen, () => setGenreMenuOpen(false));

  function removeGrade(grade: string) {
    setGrades((current) => current.filter((item) => item !== grade));
  }

  function toggleGrade(grade: string) {
    setGrades((current) => {
      if (current.includes(grade)) {
        return current.filter((item) => item !== grade);
      }

      return [...current, grade];
    });
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverImage(URL.createObjectURL(file));
  }

  function submitWriting() {
    const trimmedTitle = title.trim();
    const trimmedPrompt = prompt.trim();
    if (!trimmedTitle || !trimmedPrompt || grades.length === 0 || !genre) return;

    onSave({
      id: resource?.id ?? createWritingResourceId({ title: trimmedTitle, prompt: trimmedPrompt, grades, genre }),
      title: trimmedTitle,
      type: "Writing",
      genre,
      topic: grades.join(", ") || "Writing",
      lexile: grades.includes("1st Grade") ? 520 : 640,
      wordCount: Math.max(1000, trimmedPrompt.split(/\s+/).length * 30),
      coverImage,
      description: trimmedPrompt,
      tags: [recommended ? "recommended" : "draft", "writing prompt", genre.toLowerCase()],
    });
  }

  return (
    <div className="writing-dialog-backdrop" role="dialog" aria-modal="true" aria-label={isEditing ? "Edit Writing Prompt" : "Create Writing Prompt"}>
      <Card className="writing-create-dialog">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Writing Prompt" : "Create Writing Prompt"}</CardTitle>
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
            <div className="writing-field writing-picker" data-open={gradeMenuOpen} ref={gradeMenuRef}>
              <span>
                <em>*</em> Grade
              </span>
              <button
                type="button"
                className="writing-select-shell"
                aria-expanded={gradeMenuOpen}
                onClick={() => {
                  setGradeMenuOpen((current) => !current);
                  setGenreMenuOpen(false);
                }}
              >
                <div className="writing-grade-tags">
                  {grades.length > 0 ? (
                    grades.map((grade) => (
                      <Badge key={grade} variant="secondary" className="writing-grade-tag" onClick={(event) => event.stopPropagation()}>
                        <span>{grade}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Remove ${grade}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeGrade(grade);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              removeGrade(grade);
                            }
                          }}
                        >
                          <X size={14} />
                        </span>
                      </Badge>
                    ))
                  ) : (
                    <span className="writing-select-placeholder">Select grades</span>
                  )}
                </div>
                <ChevronDown size={18} />
              </button>
              {gradeMenuOpen && (
                <div className="writing-picker-menu">
                  {gradeOptions.map((grade) => (
                    <button key={grade} type="button" data-selected={grades.includes(grade)} onClick={() => toggleGrade(grade)}>
                      <span>{grade}</span>
                      {grades.includes(grade) && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              )}
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
                <div className="writing-picker-menu">
                  {genreOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      data-selected={genre === item}
                      onClick={() => {
                        setGenre(item);
                        setGenreMenuOpen(false);
                      }}
                    >
                      <span>{item}</span>
                      {genre === item && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
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
                {coverImage && (
                  <div className="writing-image-preview">
                    <img src={coverImage} alt="" />
                  </div>
                )}
                <label className="writing-upload-card">
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  <span>+</span>
                  <strong>Upload Image</strong>
                </label>
              </div>
            </div>
          </aside>
        </CardContent>
        <CardFooter className="writing-create-footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!title.trim() || !prompt.trim() || grades.length === 0 || !genre} onClick={submitWriting}>
            {isEditing ? "Save" : "Create"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function AssignResourceDialog({
  resource,
  classes,
  selectedClassId,
  selectedStudentIds,
  onClassChange,
  onStudentToggle,
  onStudentSelectAll,
  onClose,
  onAssign,
}: {
  resource: Resource;
  classes: ClassRoom[];
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

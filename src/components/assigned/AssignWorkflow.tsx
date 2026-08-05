import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { MatchReviewStep } from "./workflow/MatchReviewStep";
import { StudentPickerStep } from "./workflow/StudentPickerStep";
import { TaskInfoStep, type AssignContentType } from "./workflow/TaskInfoStep";

type AssignWorkflowStep = 1 | 2 | 3;

export function AssignTaskLaunchCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="assign-task-launch-card" onClick={onOpen}>
      <span>Assign</span>
    </button>
  );
}

export function AssignTaskDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="assign-task-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Assign task">
      <Card className="assign-task-dialog">
        <CardHeader>
          <CardTitle>Assign Task</CardTitle>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close assign task" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <AssignWorkflowPanel onCancel={onClose} />
        </CardContent>
      </Card>
    </div>
  );
}

function AssignWorkflowPanel({ onCancel }: { onCancel: () => void }) {
  const { data: studentDirectory = [] } = useApi(() => api.getStudentDirectory());
  const [step, setStep] = useState<AssignWorkflowStep>(1);
  const [taskCounts, setTaskCounts] = useState<Record<AssignContentType, number>>({
    Reading: 0,
    Video: 0,
    Podcast: 0,
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [defaultStudentsApplied, setDefaultStudentsApplied] = useState(false);
  if (!defaultStudentsApplied && studentDirectory.length > 0) {
    setDefaultStudentsApplied(true);
    setSelectedStudentIds(studentDirectory.slice(0, 8).map((student) => student.id));
  }
  const [keyword, setKeyword] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["All"]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["All"]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const selectedStudents = studentDirectory.filter((student) => selectedStudentIds.includes(student.id));
  const selectedTaskTypes = (Object.keys(taskCounts) as AssignContentType[]).filter((type) => taskCounts[type] > 0);
  const hasSelectedTaskType = selectedTaskTypes.length > 0;
  const hasSelectedStudents = selectedStudentIds.length > 0;
  const canGoNext = step === 1 ? hasSelectedTaskType : step === 2 ? hasSelectedStudents : true;

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
          <TaskInfoStep
            taskCounts={taskCounts}
            onToggleContentType={toggleContentType}
            onChangeTaskCount={changeTaskCount}
            keyword={keyword}
            onKeywordChange={setKeyword}
            selectedGenres={selectedGenres}
            onGenresChange={setSelectedGenres}
            genreOpen={genreOpen}
            onGenreOpenChange={setGenreOpen}
            selectedTopics={selectedTopics}
            onTopicsChange={setSelectedTopics}
            topicOpen={topicOpen}
            onTopicOpenChange={setTopicOpen}
          />
        )}
        {step === 2 && (
          <StudentPickerStep
            selectedStudentIds={selectedStudentIds}
            studentDirectory={studentDirectory}
            onToggleStudent={toggleStudent}
            onToggleAllStudents={toggleAllStudents}
          />
        )}
        {step === 3 && <MatchReviewStep selectedStudents={selectedStudents} taskCounts={taskCounts} />}
      </div>

      <div className="assign-workflow-footer">
        {validationMessage && <span className="assign-validation-message">{validationMessage}</span>}
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (step === 1) {
              onCancel();
              return;
            }

            setStep((current) => (current - 1) as AssignWorkflowStep);
          }}
        >
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < 3 ? (
          <Button type="button" aria-disabled={!canGoNext} data-disabled={!canGoNext} onClick={goNext}>
            Next
          </Button>
        ) : (
          <Button type="button" onClick={onCancel}>Assign</Button>
        )}
      </div>
    </div>
  );
}

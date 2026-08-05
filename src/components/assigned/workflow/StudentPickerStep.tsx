import type { StudentDirectoryEntry } from "@/types";

export function StudentPickerStep({
  selectedStudentIds,
  studentDirectory,
  onToggleStudent,
  onToggleAllStudents,
}: {
  selectedStudentIds: string[];
  studentDirectory: StudentDirectoryEntry[];
  onToggleStudent: (studentId: string) => void;
  onToggleAllStudents: () => void;
}) {
  return (
    <div className="assign-step-panel assign-student-picker">
      <div className="assign-student-chip-grid">
        <button
          type="button"
          className="assign-student-select-all"
          data-selected={selectedStudentIds.length === studentDirectory.length}
          onClick={onToggleAllStudents}
        >
          <span className="assign-select-all-mark">All</span>
          <span>select all</span>
        </button>
        {studentDirectory.map((student) => {
          const selected = selectedStudentIds.includes(student.id);
          return (
            <button key={student.id} type="button" data-selected={selected} onClick={() => onToggleStudent(student.id)}>
              <img src={student.avatarImage} alt="" />
              <span>{student.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

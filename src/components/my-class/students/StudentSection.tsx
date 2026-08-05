import { useRef, useState } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { convertArToLexile, convertLexileToAr, normalizeArInput, normalizeLexileInput } from "@/lib/lexile";
import { useClickOutside } from "@/lib/useClickOutside";
import type { StudentDirectoryEntry } from "@/types";

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
  const [formAnchor, setFormAnchor] = useState({ open: editOpen, lexile: student.lexile, ar: student.ar });

  useClickOutside(menuRef, menuOpen, () => setMenuOpen(false));

  if (formAnchor.open !== editOpen || formAnchor.lexile !== student.lexile || formAnchor.ar !== student.ar) {
    setFormAnchor({ open: editOpen, lexile: student.lexile, ar: student.ar });
    if (editOpen) {
      setLexileValue(String(student.lexile));
      setArValue(String(student.ar));
    }
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

export function StudentSection({
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

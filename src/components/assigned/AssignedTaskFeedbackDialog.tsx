import { useState } from "react";
import { ChevronRight, MessageSquareText, Mic, Send, X } from "lucide-react";
import { api } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { getAssignedRowMeta, getAssignedRowResource } from "@/lib/assignedTasks";
import type { AssignedTaskRow } from "@/types";

export function AssignedTaskFeedbackDialog({
  row,
  onClose,
}: {
  row: AssignedTaskRow;
  onClose: () => void;
}) {
  const { data: feedback } = useApi(() => api.getFeedbackContent());
  const [taskContentExpanded, setTaskContentExpanded] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const questions = feedback?.questions ?? [];
  const activeId = activeQuestionId ?? questions[0]?.id;
  const activeQuestion = questions.find((question) => question.id === activeId) ?? questions[0];
  const resource = getAssignedRowResource(row);
  const meta = getAssignedRowMeta(row);

  if (!feedback) return null;

  return (
    <div className="feedback-backdrop" role="dialog" aria-modal="true" aria-label={`Feedback for ${row.recipient}`}>
      <Card className="assigned-feedback-dialog">
        <CardHeader>
          <div>
            <CardDescription>Feedback</CardDescription>
            <CardTitle>{row.recipient}</CardTitle>
          </div>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close feedback" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="assigned-feedback-layout">
          <section className="assigned-feedback-left">
            <Card className="assigned-feedback-task-card">
              <CardContent>
                <div className="assigned-feedback-task-head" data-type={row.taskType === "Writing prompt" ? "Writing" : row.taskType}>
                  <div className="assigned-feedback-task-summary">
                    <button
                      type="button"
                      className="assigned-feedback-task-expand"
                      aria-label={taskContentExpanded ? "Collapse task content" : "Expand task content"}
                      aria-expanded={taskContentExpanded}
                      onClick={() => setTaskContentExpanded((current) => !current)}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div>
                      <strong>{resource.title}</strong>
                      <div className="assigned-feedback-task-tags">
                        <span>{meta}</span>
                        <span>{resource.genre}</span>
                        <span>{resource.topic}</span>
                        <span>{row.sentAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {taskContentExpanded && <p className="assigned-feedback-task-body">{resource.description}</p>}
              </CardContent>
            </Card>
            <Card className="assigned-feedback-result-card">
              <CardContent>
                <div className="assigned-feedback-result-head">
                  <strong>Student Completion</strong>
                  <Badge variant="secondary" className="assigned-task-status" data-status={row.status}>
                    {row.status}
                  </Badge>
                </div>
                <div className="assigned-feedback-question-tabs" aria-label="Quiz questions">
                  {questions.map((question) => {
                    const answeredCorrectly = question.selected === question.correct;
                    return (
                      <button
                        key={question.id}
                        type="button"
                        data-state={answeredCorrectly ? "correct" : "incorrect"}
                        data-active={activeQuestion.id === question.id}
                        aria-label={`Question ${question.id}`}
                        onClick={() => setActiveQuestionId(question.id)}
                      >
                        {question.id}
                      </button>
                    );
                  })}
                </div>
                <div className="assigned-feedback-question-card">
                  <h3>{activeQuestion.question}</h3>
                  <div className="assigned-feedback-option-list">
                    {activeQuestion.options.map(([letter, text]) => {
                      const isCorrect = letter === activeQuestion.correct;
                      const isSelected = letter === activeQuestion.selected;
                      return (
                        <div
                          className="assigned-feedback-option"
                          data-correct={isCorrect}
                          data-selected={isSelected}
                          data-wrong={isSelected && !isCorrect}
                          key={letter}
                        >
                          <strong>{letter}</strong>
                          <span>{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          <aside className="assigned-feedback-right">
            <div className="assigned-feedback-chat-list">
              {feedback.messages.map((message) => (
                <div className="assigned-feedback-chat-message" key={message.id}>
                  <span>{message.time}</span>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
            <div className="assigned-feedback-composer">
              <textarea placeholder="Write feedback to the student..." />
              <div>
                <Button variant="outline" size="icon" aria-label="Record voice feedback">
                  <Mic size={18} />
                </Button>
                <Button variant="outline" className="assigned-feedback-ai-button">
                  <MessageSquareText size={18} />
                  AI Feedback
                </Button>
                <Button>
                  <Send size={18} />
                  Send
                </Button>
              </div>
            </div>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}

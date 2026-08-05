import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { ReadingDetailArticle, ReadingQuizItem, ReadingVocabularyItem } from "@/types";

function QuizBlock({ item }: { item: ReadingQuizItem }) {
  let options: Array<{ txt: string; option: string }> = [];
  try {
    const parsed = JSON.parse(item.options);
    if (Array.isArray(parsed)) {
      options = parsed.filter((value): value is { txt: string; option: string } => value && typeof value === "object");
    }
  } catch {
    // options 解析失败时忽略
  }
  const answers = item.answer
    .split(",")
    .map((answer) => answer.trim().toUpperCase())
    .filter(Boolean);

  return (
    <div className="reading-preview-quiz">
      <p className="reading-preview-question">
        <strong>{item.no}.</strong> {item.question}
      </p>
      {options.length > 0 && (
        <ol className="reading-preview-options">
          {options.map((option) => {
            const correct = answers.includes(option.option.toUpperCase());
            return (
              <li key={option.option} data-correct={correct}>
                <span>{option.option}.</span> {option.txt}
                {correct && <Badge className="reading-preview-answer-badge">Answer</Badge>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function ReadingPreviewDialog({
  detail,
  vocabulary,
  quiz,
  loading,
  error,
  onClose,
}: {
  detail: ReadingDetailArticle | null;
  vocabulary: ReadingVocabularyItem[];
  quiz: ReadingQuizItem[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"Content" | "Vocabulary" | "Quiz">("Content");
  const tabs: Array<"Content" | "Vocabulary" | "Quiz"> = ["Content", "Vocabulary", "Quiz"];

  return (
    <div className="writing-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Reading Preview">
      <Card className="reading-preview-dialog">
        <CardHeader>
          <CardTitle>{detail?.title ?? "Reading Preview"}</CardTitle>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close reading preview" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        {detail && (
          <div className="reading-preview-tabs" role="tablist" aria-label="Reading preview sections">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className="reading-preview-tab"
                data-active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === "Vocabulary" && vocabulary.length > 0 && (
                  <span className="reading-preview-tab-count">{vocabulary.length}</span>
                )}
                {tab === "Quiz" && quiz.length > 0 && (
                  <span className="reading-preview-tab-count">{quiz.length}</span>
                )}
              </button>
            ))}
          </div>
        )}
        <CardContent className="reading-preview-content">
          {loading && <p className="writing-detail-loading">加载中…</p>}
          {error && <p className="writing-detail-error">{error}</p>}
          {detail && (
            <>
              {activeTab === "Content" && (
                <section className="reading-preview-section">
                  <div className="reading-preview-head">
                    {detail.img && <img src={resolveMediaUrl(detail.img)} alt="" />}
                    <div className="reading-preview-meta">
                      {[detail.lexile, detail.grade, detail.subject, detail.topic]
                        .filter(Boolean)
                        .map((label) => (
                          <Badge key={label} variant="secondary">
                            {label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <p className="reading-preview-body">{detail.content}</p>
                </section>
              )}

              {activeTab === "Vocabulary" &&
                (vocabulary.length > 0 ? (
                  <section className="reading-preview-section">
                    <ul className="reading-preview-vocabulary">
                      {vocabulary.map((item) => (
                        <li key={item.id}>
                          <strong>{item.word}</strong>
                          <span>{item.pos}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : (
                  <p className="reading-preview-empty">暂无单词</p>
                ))}

              {activeTab === "Quiz" &&
                (quiz.length > 0 ? (
                  <section className="reading-preview-section">
                    <div className="reading-preview-quiz-list">
                      {quiz.map((item) => (
                        <QuizBlock key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ) : (
                  <p className="reading-preview-empty">暂无题目</p>
                ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

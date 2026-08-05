import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { AudioDetail, MediaQuizItem, VideoDetail } from "@/types";

function formatMinutes(totalSeconds?: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "";
  return `${Math.max(1, Math.round(totalSeconds / 60))} min`;
}

function MediaQuizBlock({ item }: { item: MediaQuizItem }) {
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

export function MediaPreviewDialog({
  media,
  kind,
  loading,
  error,
  onClose,
}: {
  media: AudioDetail | VideoDetail | null;
  kind: "Podcast" | "Video";
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"Player" | "Quiz">("Player");
  const isVideo = kind === "Video";
  const quiz = media?.quiz ?? [];
  const playerSrc = media ? resolveMediaUrl(media.path) : undefined;
  const poster =
    media && isVideo
      ? resolveMediaUrl((media as VideoDetail).thumbnail ?? (media as VideoDetail).cover_img ?? media.cover)
      : undefined;

  return (
    <div className="writing-dialog-backdrop" role="dialog" aria-modal="true" aria-label={`${kind} Preview`}>
      <Card className="media-preview-dialog">
        <CardHeader>
          <CardTitle>{media?.title ?? (isVideo ? "Video Preview" : "Audio Preview")}</CardTitle>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label={`Close ${kind} preview`} onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        {media && (
          <div className="reading-preview-tabs" role="tablist" aria-label="Media preview sections">
            {(["Player", "Quiz"] as const).map((tab) => (
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
                {tab === "Quiz" && quiz.length > 0 && <span className="reading-preview-tab-count">{quiz.length}</span>}
              </button>
            ))}
          </div>
        )}
        <CardContent className="media-preview-content">
          {loading && <p className="writing-detail-loading">加载中…</p>}
          {error && <p className="writing-detail-error">{error}</p>}
          {media && (
            <>
              {activeTab === "Player" && (
                <section className="media-preview-player-section">
                  <div className="media-preview-meta">
                    {[media.category, media.lexile_num ? `${media.lexile_num}L` : "", formatMinutes(media.time_length), media.topic]
                      .filter(Boolean)
                      .map((label) => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                  </div>
                  {isVideo ? (
                    <video className="media-preview-video" controls poster={poster} src={playerSrc} />
                  ) : (
                    <div className="media-preview-audio">
                      {media.cover && <img src={resolveMediaUrl(media.cover)} alt="" />}
                      <audio controls src={playerSrc} />
                    </div>
                  )}
                </section>
              )}
              {activeTab === "Quiz" &&
                (quiz.length > 0 ? (
                  <div className="reading-preview-quiz-list">
                    {quiz.map((item) => (
                      <MediaQuizBlock key={item.id} item={item} />
                    ))}
                  </div>
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

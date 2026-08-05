import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeFilterIcon } from "@/components/shared/TypeFilterIcon";
import type { Resource } from "@/types";

function PreviewIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M21.25 9.14993C18.94 5.51993 15.56 3.42993 12 3.42993C10.22 3.42993 8.49 3.94993 6.91 4.91993C5.33 5.89993 3.91 7.32993 2.75 9.14993C1.75 10.7199 1.75 13.2699 2.75 14.8399C5.06 18.4799 8.44 20.5599 12 20.5599C13.78 20.5599 15.51 20.0399 17.09 19.0699C18.67 18.0899 20.09 16.6599 21.25 14.8399C22.25 13.2799 22.25 10.7199 21.25 9.14993ZM12 16.0399C9.76 16.0399 7.96 14.2299 7.96 11.9999C7.96 9.76993 9.76 7.95993 12 7.95993C14.24 7.95993 16.04 9.76993 16.04 11.9999C16.04 14.2299 14.24 16.0399 12 16.0399Z"
        fill="currentColor"
      />
      <path
        d="M11.9999 9.13989C10.4299 9.13989 9.1499 10.4199 9.1499 11.9999C9.1499 13.5699 10.4299 14.8499 11.9999 14.8499C13.5699 14.8499 14.8599 13.5699 14.8599 11.9999C14.8599 10.4299 13.5699 9.13989 11.9999 9.13989Z"
        fill="currentColor"
      />
    </svg>
  );
}

function AssignIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.88 11.49C11.96 11.48 12.04 11.48 12.1 11.49C12.12 11.49 12.13 11.49 12.15 11.49C12.16 11.49 12.16 11.49 12.17 11.49C14.73 11.4 16.74 9.32 16.75 6.75C16.75 4.13 14.62 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M17.08 14.15C14.29 12.29 9.73996 12.29 6.92996 14.15C5.65996 15 4.95996 16.15 4.95996 17.38C4.95996 18.61 5.65996 19.75 6.91996 20.59C8.31996 21.53 10.16 22 12 22C13.84 22 15.68 21.53 17.08 20.59C18.34 19.74 19.04 18.6 19.04 17.36C19.03 16.13 18.34 14.99 17.08 14.15Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ResourceCoverFallback() {
  return (
    <div className="resource-cover-fallback">
      <TypeFilterIcon type="Writing" />
    </div>
  );
}

export function ResourceCard({
  resource,
  onAssign,
  onEdit,
}: {
  resource: Resource;
  onAssign: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
}) {
  const isTextResource = "wordCount" in resource;
  const detail = isTextResource ? `${resource.wordCount.toLocaleString()} words` : resource.duration;

  return (
    <Card className="resource-card gap-0 overflow-hidden py-0">
      <div className="resource-cover">
        {resource.coverImage ? <img src={resource.coverImage} alt={`${resource.title} cover`} /> : <ResourceCoverFallback />}
        <Badge variant="secondary" className="resource-genre-badge">
          {resource.genre}
        </Badge>
      </div>
      <div className="resource-card-body">
        <CardHeader className="resource-card-header">
          <CardTitle className="resource-card-title">{resource.title}</CardTitle>
        </CardHeader>
        <CardContent className="resource-card-meta">
          {[`${resource.lexile}L`, detail, resource.type].map((label) => (
            <Badge key={label} variant="secondary" className="resource-card-badge">
              {label}
            </Badge>
          ))}
        </CardContent>
        <CardFooter className="resource-card-actions">
          <button type="button" className="resource-action resource-action-preview" onClick={onEdit ? () => onEdit(resource) : undefined}>
            <PreviewIcon />
            <span>{onEdit ? "Edit" : "Preview"}</span>
          </button>
          <button type="button" className="resource-action resource-action-assign" onClick={() => onAssign(resource)}>
            <AssignIcon />
            <span>Assign</span>
          </button>
        </CardFooter>
      </div>
    </Card>
  );
}

export function CreateWritingCard({ onCreate }: { onCreate: () => void }) {
  return (
    <button type="button" className="create-writing-card" onClick={onCreate}>
      <span className="create-writing-icon">+</span>
      <strong>Create Writing Prompt</strong>
    </button>
  );
}

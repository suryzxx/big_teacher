import type { Resource } from "@/types";
import { CreateWritingCard, ResourceCard } from "./ResourceCard";

function PaginationArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {direction === "left" ? (
        <path
          d="M15 19.92L8.48 13.4C7.71 12.63 7.71 11.37 8.48 10.6L15 4.07996"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M8.91 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.91 4.07996"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function ResourceGrid({
  resources,
  showCreateWritingCard,
  totalPages,
  totalItemCount,
  currentPage,
  visiblePageNumbers,
  createdWritingResourceIds,
  onCreateWriting,
  onAssignResource,
  onEditWritingResource,
  onPageChange,
}: {
  resources: Resource[];
  showCreateWritingCard: boolean;
  totalPages: number;
  totalItemCount: number;
  currentPage: number;
  visiblePageNumbers: number[];
  createdWritingResourceIds: Set<string>;
  onCreateWriting: () => void;
  onAssignResource: (resource: Resource) => void;
  onEditWritingResource: (resource: Resource) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="library-main">
      <section className="resource-grid">
        {showCreateWritingCard && <CreateWritingCard onCreate={onCreateWriting} />}
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onAssign={onAssignResource}
            onEdit={createdWritingResourceIds.has(resource.id) ? onEditWritingResource : undefined}
          />
        ))}
      </section>
      {totalPages > 1 && (
        <nav className="library-pagination" aria-label="Library pagination">
          <span>Total {totalItemCount} items</span>
          <div className="library-page-controls">
            <button
              type="button"
              className="library-page-arrow"
              disabled={currentPage === 1}
              aria-label="Previous page"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <PaginationArrow direction="left" />
            </button>
            {visiblePageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className="library-page-number"
                aria-current={currentPage === pageNumber ? "page" : undefined}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              className="library-page-arrow"
              disabled={currentPage === totalPages}
              aria-label="Next page"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
              <PaginationArrow direction="right" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

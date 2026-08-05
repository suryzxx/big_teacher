import { useRef } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { removeMultiSelectOption, toggleMultiSelectOption } from "@/lib/multiSelectOptions";
import { useClickOutside } from "@/lib/useClickOutside";

export function MultiSelect({
  label,
  options,
  values,
  open,
  onOpenChange,
  onChange,
  helper,
  required = true,
}: {
  label: string;
  options: string[];
  values: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (values: string[]) => void;
  helper?: string;
  required?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(rootRef, open, () => onOpenChange(false));

  function selectOption(option: string) {
    onChange(toggleMultiSelectOption(values, option, "All"));
  }

  function removeOption(option: string) {
    onChange(removeMultiSelectOption(values, option, "All"));
  }

  return (
    <div className="assign-multi-select" data-open={open} ref={rootRef}>
      <button
        type="button"
        className="assign-multi-trigger"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
      >
        {required && <span className="assign-required">*</span>}
        <strong>{label}</strong>
        {helper && <em>{helper}</em>}
      </button>
      <div
        role="button"
        tabIndex={0}
        className="assign-multi-value"
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onOpenChange(!open);
          }
        }}
      >
        {values.length > 0 ? (
          values.map((value) => (
            <Badge key={value} variant="secondary" className="assign-multi-badge" onClick={(event) => event.stopPropagation()}>
              <span>{value}</span>
              {value !== "All" && (
                <span
                  role="button"
                  tabIndex={0}
                  className="assign-multi-remove"
                  aria-label={`Remove ${value}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeOption(value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      removeOption(value);
                    }
                  }}
                >
                  <X size={14} />
                </span>
              )}
            </Badge>
          ))
        ) : (
          <span className="assign-multi-placeholder">Select {label.toLowerCase()}</span>
        )}
      </div>
      {open && (
        <div className="assign-multi-menu">
          {options.map((option) => {
            const selected = values.includes(option);
            return (
              <button
                key={option}
                type="button"
                data-selected={selected}
                onClick={(event) => {
                  event.stopPropagation();
                  selectOption(option);
                }}
              >
                <span>{option}</span>
                {selected && <CheckCircle2 size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

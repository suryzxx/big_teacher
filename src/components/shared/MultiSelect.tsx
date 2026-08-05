import { useRef, useState } from "react";
import { CheckCircle2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/shared/DropdownMenu";
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
  allOption = "All",
  searchable = true,
}: {
  label: string;
  options: string[];
  values: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (values: string[]) => void;
  helper?: string;
  required?: boolean;
  /** 提供"全部"选项文案；传 undefined 表示不启用该语义，允许清空选择。 */
  allOption?: string;
  /** 是否在菜单顶部提供关键词搜索过滤。 */
  searchable?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");

  useClickOutside(rootRef, open, () => onOpenChange(false));

  function toggleOpen(nextOpen: boolean) {
    if (nextOpen) setSearch("");
    onOpenChange(nextOpen);
  }

  function selectOption(option: string) {
    if (allOption === undefined) {
      onChange(values.includes(option) ? values.filter((value) => value !== option) : [...values, option]);
      return;
    }
    onChange(toggleMultiSelectOption(values, option, allOption));
  }

  function removeOption(option: string) {
    if (allOption === undefined) {
      onChange(values.filter((value) => value !== option));
      return;
    }
    onChange(removeMultiSelectOption(values, option, allOption));
  }

  return (
    <div className="assign-multi-select" data-open={open} ref={rootRef}>
      <button
        type="button"
        className="assign-multi-trigger"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          toggleOpen(!open);
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
          toggleOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            toggleOpen(!open);
          }
        }}
      >
        {values.length > 0 ? (
          values.map((value) => (
            <Badge key={value} variant="secondary" className="assign-multi-badge" onClick={(event) => event.stopPropagation()}>
              <span>{value}</span>
              {allOption !== undefined && value === allOption ? null : (
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
        <DropdownMenu
          width="full"
          scroll
          header={
            searchable ? (
              <label className="multi-select-search">
                <Search size={14} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索"
                />
              </label>
            ) : undefined
          }
        >
          {options
            .filter((option) => option.toLowerCase().includes(search.trim().toLowerCase()))
            .map((option) => {
              const selected = values.includes(option);
              return (
                <DropdownMenuItem key={option} selected={selected} onSelect={() => selectOption(option)}>
                  <span>{option}</span>
                  {selected && <CheckCircle2 size={16} />}
                </DropdownMenuItem>
              );
            })}
          {search.trim() !== "" && !options.some((option) => option.toLowerCase().includes(search.trim().toLowerCase())) && (
            <div className="multi-select-empty">无匹配选项</div>
          )}
        </DropdownMenu>
      )}
    </div>
  );
}

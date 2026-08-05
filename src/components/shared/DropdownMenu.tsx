import { type ButtonHTMLAttributes, type ReactNode } from "react";

export function DropdownMenu({
  children,
  align = "left",
  width = "auto",
  scroll = false,
  header,
  role = "menu",
  label,
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  width?: "auto" | "full";
  scroll?: boolean;
  header?: ReactNode;
  role?: "menu" | "listbox";
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={className ? `dropdown-menu ${className}` : "dropdown-menu"}
      data-align={align}
      data-width={width}
      data-scroll={scroll}
      role={role}
      aria-label={label}
    >
      {header}
      {scroll ? <div className="dropdown-menu-scroll">{children}</div> : children}
    </div>
  );
}

export function DropdownMenuItem({
  selected,
  onSelect,
  children,
  ...props
}: {
  selected?: boolean;
  onSelect: () => void;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <button type="button" className="dropdown-menu-item" data-selected={selected} onClick={onSelect} {...props}>
      {children}
    </button>
  );
}

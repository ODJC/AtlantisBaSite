import * as React from "react";
import { cn } from "../../lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "destructive" | "secondary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "bg-[var(--fs-badge,#ccfbf1)] text-[var(--fs-badge-fg,#115e59)]",
        variant === "success" && "bg-emerald-100 text-emerald-800",
        variant === "warning" && "bg-amber-100 text-amber-800",
        variant === "destructive" && "bg-red-100 text-red-800",
        variant === "secondary" && "bg-slate-100 text-slate-700",
        className
      )}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
  dark?: boolean;
};

export function AdminPageHeader({
  title,
  subtitle,
  badge,
  actions,
  dark = false,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge && (
          <span
            className={cn(
              "mb-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest",
              dark
                ? "bg-polisario/35 text-green-300"
                : "bg-polisario/10 text-polisario",
            )}
          >
            {badge}
          </span>
        )}
        <h1
          className={cn(
            "text-2xl font-bold sm:text-3xl",
            dark ? "text-white" : "text-text-main",
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-1 max-w-xl text-sm",
              dark ? "text-neutral-300" : "text-text-main/65",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

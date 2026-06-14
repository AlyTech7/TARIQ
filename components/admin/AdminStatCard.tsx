import { cn } from "@/lib/utils";
import { superPanel } from "@/components/admin/super-theme";
import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  variant?: "light" | "dark" | "accent";
  className?: string;
};

export function AdminStatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  variant = "light",
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden p-5",
        variant === "light" && "tariq-stat-card",
        variant === "dark" && superPanel,
        variant === "accent" &&
          "rounded-2xl border border-polisario/30 bg-gradient-to-br from-polisario/15 to-polisario/5",
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              variant === "dark" ? "text-neutral-400" : "text-text-main/60",
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold tabular-nums",
              variant === "dark" ? "text-white" : "text-text-main",
            )}
          >
            {value}
          </p>
          {sub && (
            <p
              className={cn(
                "mt-1 text-xs",
                variant === "dark" ? "text-neutral-400" : "text-text-main/55",
              )}
            >
              {sub}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trend.positive ? "text-green-400" : "text-sun",
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            variant === "dark"
              ? "bg-polisario/30 text-green-300"
              : "bg-polisario/10 text-polisario",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

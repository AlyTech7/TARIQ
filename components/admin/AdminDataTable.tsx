import { cn } from "@/lib/utils";
import { superGlass } from "@/components/admin/super-theme";
import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
};

type AdminDataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T) => string;
  emptyMessage?: string;
  dark?: boolean;
  onRowClick?: (row: T) => void;
};

export function AdminDataTable<T>({
  columns,
  data,
  keyFn,
  emptyMessage = "Sin datos",
  dark = false,
  onRowClick,
}: AdminDataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl p-12 text-center text-sm",
          dark ? cn(superGlass, "text-neutral-400") : "tariq-admin-glass text-text-main/55",
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl",
        dark ? superGlass : "tariq-admin-glass",
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={cn(
                "border-b text-start text-xs font-semibold uppercase tracking-wider",
                dark
                  ? "border-polisario/20 text-neutral-400"
                  : "border-sand/30 text-text-main/55",
              )}
            >
              {columns.map((col) => (
                <th key={col.key} className={cn("px-4 py-3", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={keyFn(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b transition-colors last:border-0",
                  dark
                    ? "border-polisario/10 hover:bg-polisario/5"
                    : "border-sand/15 hover:bg-polisario/3",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3.5", col.className)}
                  >
                    {col.cell(row, data.indexOf(row))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

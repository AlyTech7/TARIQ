import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-polisario text-white",
        secondary: "border-transparent bg-sand text-text-main",
        destructive: "border-transparent bg-alert text-white",
        outline: "text-text-main border-sand",
        verified: "border-transparent bg-green-600 text-white",
        pending: "border-transparent bg-sun text-text-main",
        cancelled: "border-transparent bg-gray-400 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

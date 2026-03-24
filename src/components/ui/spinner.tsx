import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function Spinner({ className }: Props) {
  return (
    <div
      aria-label="Đang tải…"
      role="status"
      className={cn(
        "size-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500",
        className,
      )}
    />
  );
}

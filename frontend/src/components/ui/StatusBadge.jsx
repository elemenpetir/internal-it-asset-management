import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles = {
  available: "bg-green-500/15 text-green-400",
  assigned: "bg-blue-500/15 text-blue-400",
  under_maintenance: "bg-amber-500/15 text-amber-400",
  retired: "bg-slate-500/15 text-slate-400",
  active: "bg-green-500/15 text-green-400",
  returned: "bg-slate-500/15 text-slate-400",
  reported: "bg-blue-500/15 text-blue-400",
  in_progress: "bg-amber-500/15 text-amber-400",
  completed: "bg-green-500/15 text-green-400",
  canceled: "bg-slate-500/15 text-slate-400",
};

const labels = {
  under_maintenance: "Maintenance",
  in_progress: "In progress",
};

export default function StatusBadge({ status, className }) {
  // B32: null/unknown statuses render an explicit label, never an empty badge
  if (!status || !styles[status]) {
    return (
      <Badge className={cn("bg-slate-500/15 text-slate-400", className)}>
        {status || "unknown"}
      </Badge>
    );
  }
  return (
    <Badge
      className={cn(
        styles[status],
        className,
      )}
    >
      {labels[status] || status}
    </Badge>
  );
}

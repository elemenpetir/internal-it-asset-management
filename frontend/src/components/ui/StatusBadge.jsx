import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles = {
  available: "bg-green-100 text-green-700",
  assigned: "bg-blue-100 text-blue-700",
  under_maintenance: "bg-amber-100 text-amber-700",
  retired: "bg-slate-200 text-slate-600",
  active: "bg-green-100 text-green-700",
  returned: "bg-slate-200 text-slate-600",
  reported: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  canceled: "bg-slate-200 text-slate-600",
};

const labels = {
  under_maintenance: "Maintenance",
  in_progress: "In progress",
};

export default function StatusBadge({ status, className }) {
  return (
    <Badge className={cn(styles[status] || "bg-slate-200 text-slate-600", className)}>
      {labels[status] || status}
    </Badge>
  );
}

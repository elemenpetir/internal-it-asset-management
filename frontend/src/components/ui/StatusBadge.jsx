export default function StatusBadge({ status }) {
  const statusStyles = {
    available: "bg-green-50 text-green-700 border-green-200",
    assigned: "bg-blue-50 text-blue-700 border-blue-200",
    under_maintenance: "bg-amber-50 text-amber-700 border-amber-200",
    retired: "bg-red-50 text-red-700 border-red-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    returned: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const statusLabels = {
    available: "Available",
    assigned: "Assigned",
    under_maintenance: "Under Maintenance",
    retired: "Retired",
    active: "Active",
    returned: "Returned",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
        statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}

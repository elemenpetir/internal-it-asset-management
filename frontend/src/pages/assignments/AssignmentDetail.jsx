import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    async function fetchAssignmentDetail() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/asset-assignments/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch assignment detail",
          );
        }
        setAssignment(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssignmentDetail();
  }, [id]);

  async function handleReturnAssignment() {
    const confirmed = window.confirm(
      `Return asset ${assignment.asset_code} from ${assignment.employee_name}?`,
    );
    if (!confirmed) return;
    try {
      setIsReturning(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/asset-assignments/${id}/return`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to return asset");
      }
      setAssignment({
        ...assignment,
        status: "returned",
        returned_at: new Date().toISOString().slice(0, 10),
      });
      toast.success("Asset returned successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsReturning(false);
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-100">Assignment</h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  const details = [
    ["Asset code", <span className="font-mono">{assignment.asset_code}</span>],
    ["Asset name", assignment.asset_name],
    [
      "Employee",
      <>
        {assignment.employee_name}{" "}
        <span className="font-mono text-xs text-slate-400">
          ({assignment.employee_number})
        </span>
      </>,
    ],
    ["Assigned by", assignment.assigned_by_name],
    [
      "Assigned at",
      <span className="tabular-nums">
        {assignment.assigned_at?.slice(0, 10)}
      </span>,
    ],
    [
      "Returned at",
      <span className="tabular-nums">
        {assignment.returned_at?.slice(0, 10) || "-"}
      </span>,
    ],
    ["Notes", assignment.notes || <span className="text-slate-400">-</span>],
  ];

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold text-slate-100">
            {assignment.asset_code}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {assignment.asset_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={assignment.status} />
          {assignment.status === "active" && (
            <Button
              variant="outline"
              onClick={handleReturnAssignment}
              disabled={isReturning}
            >
              {isReturning ? "Returning..." : "Return asset"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <dl className="grid gap-3 md:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd className="mt-0.5 text-[13px] text-slate-300">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4">
        <Link
          to="/assignments"
          className="inline-flex items-center gap-1 text-[13px] text-slate-400 hover:text-slate-300"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to assignments
        </Link>
      </div>
    </section>
  );
}

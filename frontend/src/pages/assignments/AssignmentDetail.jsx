import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

export default function AssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [actionError, setActionError] = useState("");
  const [localSuccessMessage, setLocalSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchAssignmentDetail() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:3000/api/asset-assignments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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
      setActionError("");
      setLocalSuccessMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/asset-assignments/${id}/return`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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

      setLocalSuccessMessage("Asset returned successfully.");
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsReturning(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Assignment Detail"
          description="View detailed information for this asset assignment."
        />
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading assignment detail...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Assignment Detail"
          description="View detailed information for this asset assignment."
        />
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Assignment Detail"
        description="View detailed information for this asset assignment."
      />
      {localSuccessMessage && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {localSuccessMessage}
        </div>
      )}

      {actionError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {assignment.asset_code}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {assignment.asset_name}
            </p>
          </div>
          <StatusBadge status={assignment.status} />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-500">Asset Code</p>
            <p className="mt-1 text-sm text-slate-900">
              {assignment.asset_code}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Asset Name</p>
            <p className="mt-1 text-sm text-slate-900">
              {assignment.asset_name}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Employee</p>
            <p className="mt-1 text-sm text-slate-900">
              {assignment.employee_name}
            </p>
            <p className="text-xs text-slate-500">
              {assignment.employee_number}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Assigned By</p>
            <p className="mt-1 text-sm text-slate-900">
              {assignment.assigned_by_name}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Assigned At</p>
            <p className="mt-1 text-sm text-slate-900">
              {assignment.assigned_at?.slice(0, 10)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Returned At</p>
            <p className="mt-1 text-sm text-slate-900">
              {assignment.returned_at?.slice(0, 10) || "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-sm font-medium text-slate-500">Notes</p>
          <p className="mt-1 text-sm text-slate-900">
            {assignment.notes || "No notes provided."}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Link
            to="/assignments"
            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Assignments
          </Link>

          {assignment.status === "active" && (
            <button
              type="button"
              onClick={handleReturnAssignment}
              disabled={isReturning}
              className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReturning ? "Returning..." : "Return Asset"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

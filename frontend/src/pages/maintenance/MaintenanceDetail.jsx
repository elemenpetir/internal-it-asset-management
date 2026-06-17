import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

export default function MaintenanceDetail() {
  const { id } = useParams();
  const [maintenanceRequest, setMaintenanceRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  const statusOptions = {
    reported: ["in_progress", "canceled"],
    in_progress: ["completed", "canceled"],
  };

  useEffect(() => {
    async function fetchDetail() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/maintenance-requests/${id}/detail`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to fetch");
        setMaintenanceRequest(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  async function handleUpdateStatus() {
    if (!formStatus) return;
    try {
      setIsUpdating(true);
      setUpdateError("");
      setSuccessMessage("");
      const token = localStorage.getItem("token");
      const body = { status: formStatus };
      if (formStatus === "completed") body.resolution_note = resolutionNote;
      const response = await fetch(
        `http://localhost:3000/api/maintenance-requests/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update");
      setMaintenanceRequest({
        ...maintenanceRequest,
        status: formStatus,
        handled_by_name:
          formStatus === "in_progress"
            ? "You"
            : maintenanceRequest.handled_by_name,
        resolution_note: resolutionNote || maintenanceRequest.resolution_note,
        completed_at:
          formStatus === "completed"
            ? new Date().toISOString()
            : maintenanceRequest.completed_at,
      });
      setSuccessMessage("Status updated successfully.");
      setFormStatus("");
      setResolutionNote("");
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Request Details" description="" />
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader title="Request Details" description="" />
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-xs text-slate-500">
            <Link to="/maintenance" className="hover:text-indigo-600">
              Maintenance
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-700">#{id}</span>
          </nav>
          <h2 className="text-2xl font-bold text-slate-900">Request Details</h2>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={maintenanceRequest.status} />
          <Link
            to="/maintenance"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}
      {updateError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {updateError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overview Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900">
            Overview
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Status
              </p>
              <div className="mt-1">
                <StatusBadge status={maintenanceRequest.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Submitted
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {maintenanceRequest.created_at?.slice(0, 10)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Completed At
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {maintenanceRequest.completed_at?.slice(0, 10) || "-"}
              </p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium uppercase text-slate-400">
                Requested By
              </p>
              <div className="mt-2">
                <p className="text-sm font-bold text-slate-800">
                  {maintenanceRequest.requested_by_name}
                </p>
                <p className="text-xs text-slate-500">
                  {maintenanceRequest.employee_number}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Handled By
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {maintenanceRequest.handled_by_name || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Asset Card */}
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Linked Asset
              </p>
              <p className="text-base font-bold text-slate-900">
                {maintenanceRequest.asset_name}
              </p>
              <p className="text-sm font-semibold text-indigo-600">
                {maintenanceRequest.asset_code}
              </p>
            </div>
          </div>

          {/* Issue Description */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              Issue Description
            </h3>
            <div className="rounded-lg border-l-4 border-red-400 bg-slate-50 p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {maintenanceRequest.issue_description}
              </p>
            </div>
          </div>

          {/* Resolution Note */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              Resolution Note
            </h3>
            <div className="rounded-lg border-l-4 border-indigo-400 bg-slate-50 p-4">
              <p className="text-sm text-slate-700 leading-relaxed italic">
                {maintenanceRequest.resolution_note ||
                  "No resolution note provided yet."}
              </p>
            </div>
          </div>

          {/* Update Status */}
          {statusOptions[maintenanceRequest.status] && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-slate-900">
                Update Status
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select new status</option>
                  {statusOptions[maintenanceRequest.status].map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={!formStatus || isUpdating}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </button>
              </div>
              {formStatus === "completed" && (
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows="3"
                  placeholder="Resolution notes..."
                  className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

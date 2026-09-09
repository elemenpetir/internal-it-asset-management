import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, Monitor } from "lucide-react";
import { getRoleFromToken } from "../../utils/auth";
import StatusBadge from "../../components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function MaintenanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenanceRequest, setMaintenanceRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const role = getRoleFromToken();

  const statusOptions = {
    reported: ["in_progress", "canceled"],
    in_progress: ["completed", "canceled"],
  };

  useEffect(() => {
    async function fetchDetail() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/maintenance-requests/${id}/detail`,
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
      const token = localStorage.getItem("token");
      const body = { status: formStatus };
      if (formStatus === "completed") body.resolution_note = resolutionNote;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/maintenance-requests/${id}/status`,
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
      toast.success("Status updated successfully.");
      setFormStatus("");
      setResolutionNote("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
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
        <h1 className="text-xl font-bold text-slate-900">Request #{id}</h1>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  const meta = [
    ["Submitted", maintenanceRequest.created_at?.slice(0, 10) || "-"],
    ["Completed", maintenanceRequest.completed_at?.slice(0, 10) || "-"],
    [
      "Requested by",
      `${maintenanceRequest.requested_by_name} (${maintenanceRequest.employee_number})`,
    ],
    ["Handled by", maintenanceRequest.handled_by_name || "-"],
  ];

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
            <Link to="/maintenance" className="hover:text-slate-600">
              Maintenance
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-600 tabular-nums">
              #{id}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            Request #{id}
          </h1>
        </div>
        <StatusBadge status={maintenanceRequest.status} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Overview
          </p>
          <div className="mt-3 space-y-3">
            {meta.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-0.5 text-[13px] text-slate-700 tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {maintenanceRequest.asset_name}
              </p>
              <p className="font-mono text-xs text-primary">
                {maintenanceRequest.asset_code}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Issue</h2>
            <p className="mt-1.5 border-l-2 border-red-400 pl-3 text-[13px] leading-relaxed text-slate-700">
              {maintenanceRequest.issue_description}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Resolution</h2>
            <p className="mt-1.5 border-l-2 border-primary pl-3 text-[13px] leading-relaxed text-slate-700">
              {maintenanceRequest.resolution_note || (
                <span className="text-slate-400">No resolution yet.</span>
              )}
            </p>
          </div>

          {statusOptions[maintenanceRequest.status] &&
            role === "asset_admin" && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Update status
                </h2>
                <div className="mt-2.5 flex gap-2">
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger className="max-w-56">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions[maintenanceRequest.status].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={!formStatus || isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </Button>
                </div>
                {formStatus === "completed" && (
                  <div className="mt-2.5 space-y-1.5">
                    <Label>Resolution note</Label>
                    <Textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      rows={3}
                      placeholder="What was done to resolve the issue..."
                    />
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      <div className="mt-4">
        <Link
          to="/maintenance"
          className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to maintenance
        </Link>
      </div>
    </section>
  );
}

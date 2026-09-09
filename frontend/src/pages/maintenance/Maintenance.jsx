import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { getRoleFromToken } from "../../utils/auth";
import StatusBadge from "../../components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Maintenance() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const role = getRoleFromToken();

  useEffect(() => {
    async function loadMaintenanceData() {
      try {
        const token = localStorage.getItem("token");
        const endpoint =
          role === "employee"
            ? `${import.meta.env.VITE_API_URL}/api/maintenance-requests/my-requests`
            : `${import.meta.env.VITE_API_URL}/api/maintenance-requests`;
        const response = await fetch(`${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch maintenance requests",
          );
        }
        setMaintenanceRequests(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadMaintenanceData();
  }, [role]);

  const reportedCount = maintenanceRequests.filter(
    (r) => r.status === "reported",
  ).length;
  const inProgressCount = maintenanceRequests.filter(
    (r) => r.status === "in_progress",
  ).length;
  const completedCount = maintenanceRequests.filter(
    (r) => r.status === "completed",
  ).length;

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-900">Maintenance</h1>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maintenance</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Track asset maintenance requests.
          </p>
        </div>
        {(role === "employee" || role === "asset_admin") && (
          <Button onClick={() => navigate("/maintenance/new")}>
            <Plus className="h-4 w-4" />
            New request
          </Button>
        )}
      </div>

      <div className="mt-4 flex divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {[
          ["Reported", reportedCount],
          ["In progress", inProgressCount],
          ["Completed", completedCount],
        ].map(([label, count]) => (
          <div key={label} className="flex-1 px-4 py-2.5">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {label}
            </p>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {count}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : maintenanceRequests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">ID</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Requested by</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Link
                      to={`/maintenance/${request.id}`}
                      className="font-mono font-medium text-primary tabular-nums hover:underline"
                    >
                      #{request.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">
                      {request.asset_name}
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      {request.asset_code || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">
                      {request.requested_by_name}
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      {request.employee_number || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-60 truncate text-slate-500">
                    {request.issue_description}
                  </TableCell>
                  <TableCell className="text-slate-500 tabular-nums">
                    {request.created_at
                      ? request.created_at.slice(0, 10)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="p-8 text-center text-[13px] text-slate-400">
            No maintenance requests found.
          </p>
        )}
      </div>
    </section>
  );
}

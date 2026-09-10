import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    asset_id: "",
    employee_id: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const role = getRoleFromToken();
  const navigate = useNavigate();
  const isEmployee = role === "employee";
  const isAdminOnly = role === "asset_admin";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    async function loadAssignmentData() {
      try {
        if (role === "employee") {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/asset-assignments/my-assignments`,
            { headers },
          );
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.message || "Failed to fetch assignments");
          setAssignments(result.data);
        } else {
          const [assignmentsRes, assetsRes, employeesRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/api/asset-assignments`, { headers }),
            fetch(`${import.meta.env.VITE_API_URL}/api/assets?limit=all`, { headers }),
            fetch(`${import.meta.env.VITE_API_URL}/api/employees`, { headers }),
          ]);

          const [assignmentsResult, assetsResult, employeesResult] =
            await Promise.all([
              assignmentsRes.json(),
              assetsRes.json(),
              employeesRes.json(),
            ]);

          if (!assignmentsRes.ok)
            throw new Error(
              assignmentsResult.message || "Failed to fetch assignments",
            );
          if (!assetsRes.ok)
            throw new Error(assetsResult.message || "Failed to fetch assets");
          if (!employeesRes.ok)
            throw new Error(
              employeesResult.message || "Failed to fetch employees",
            );

          setAssignments(assignmentsResult.data);
          setAssets(assetsResult.data);
          setEmployees(employeesResult.data);
        }
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAssignmentData();
  }, []);

  const availableAssets = assets.filter(
    (asset) => asset.status === "available",
  );

  function handleFieldChange(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.asset_id || !formData.employee_id) {
      toast.error("Asset and employee are required.");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/asset-assignments`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            asset_id: Number(formData.asset_id),
            employee_id: Number(formData.employee_id),
            notes: formData.notes,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to assign asset");
      const assignedAssetId = Number(formData.asset_id);
      toast.success("Asset assigned successfully.");
      setFormData({ asset_id: "", employee_id: "", notes: "" });
      setAssignments((current) => [result.data, ...current]);
      setAssets((current) =>
        current.map((asset) =>
          asset.id === assignedAssetId
            ? { ...asset, status: "assigned" }
            : asset,
        ),
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReturnAssignment(assignment) {
    const confirmed = window.confirm(
      `Return asset ${assignment.asset_code} from ${assignment.employee_name}?`,
    );
    if (!confirmed) return;
    try {
      setReturningId(assignment.id);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/asset-assignments/${assignment.id}/return`,
        { method: "PATCH", headers },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to return asset");
      setAssignments((current) =>
        current.map((item) =>
          item.id === assignment.id
            ? {
                ...item,
                status: "returned",
                returned_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      setAssets((current) =>
        current.map((asset) =>
          asset.id === assignment.asset_id
            ? { ...asset, status: "available" }
            : asset,
        ),
      );
      toast.success("Asset returned successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setReturningId(null);
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
        <h1 className="text-xl font-bold text-slate-100">
          {isEmployee ? "My assignments" : "Assignments"}
        </h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (isEmployee) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-100">My assignments</h1>
        <p className="mt-0.5 text-[13px] text-slate-400">
          Assets currently and previously assigned to you.
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          {assignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Returned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow
                    key={assignment.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        navigate(`/assignments/${assignment.id}`);
                    }}
                  >
                    <TableCell>
                      <div className="font-medium text-slate-200">
                        {assignment.asset_name}
                      </div>
                      <div className="font-mono text-xs text-slate-400">
                        {assignment.asset_code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={assignment.status} />
                    </TableCell>
                    <TableCell className="text-slate-400 tabular-nums">
                      {assignment.assigned_at?.slice(0, 10) || "-"}
                    </TableCell>
                    <TableCell className="text-slate-400 tabular-nums">
                      {assignment.returned_at?.slice(0, 10) || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-[13px] text-slate-400">
              No assignments found.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-xl font-bold text-slate-100">Assignments</h1>
      <p className="mt-0.5 text-[13px] text-slate-400">
        Assign available assets to active employees.
      </p>

      <div className={`mt-4 grid gap-4 ${isAdminOnly ? "lg:grid-cols-3" : ""}`}>
        {isAdminOnly && (
          <div className="rounded-lg border border-border bg-card p-4 lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-100">
              New assignment
            </h2>
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
              <div className="space-y-1.5">
                <Label>Asset</Label>
                <Select
                  value={formData.asset_id}
                  onValueChange={(value) =>
                    handleFieldChange("asset_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select available asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssets.map((asset) => (
                      <SelectItem key={asset.id} value={String(asset.id)}>
                        {asset.asset_code} ({asset.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Employee</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) =>
                    handleFieldChange("employee_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.name} ({employee.employee_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Assigning..." : "Assign asset"}
              </Button>
            </form>
          </div>
        )}

        <div
          className={`overflow-hidden rounded-lg border border-border bg-card ${isAdminOnly ? "lg:col-span-2" : ""}`}
        >
          <div className="flex flex-wrap gap-px border-b border-border bg-border">
            <div className="min-w-28 flex-1 bg-card px-4 py-2.5">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Assignments
              </p>
              <p className="text-lg font-bold text-slate-100 tabular-nums">
                {assignments.length}
              </p>
            </div>
            <div className="min-w-28 flex-1 bg-card px-4 py-2.5">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Available
              </p>
              <p className="text-lg font-bold text-slate-100 tabular-nums">
                {availableAssets.length}
              </p>
            </div>
            <div className="min-w-28 flex-1 bg-card px-4 py-2.5">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Employees
              </p>
              <p className="text-lg font-bold text-slate-100 tabular-nums">
                {employees.length}
              </p>
            </div>
          </div>

          {assignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="font-mono font-medium text-link hover:underline"
                      >
                        {assignment.asset_code ||
                          `Asset #${assignment.asset_id}`}
                      </Link>
                      <div className="text-xs text-slate-400">
                        {assignment.asset_name || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-200">
                        {assignment.employee_name ||
                          `Employee #${assignment.employee_id}`}
                      </div>
                      <div className="font-mono text-xs text-slate-400">
                        {assignment.employee_number || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={assignment.status} />
                    </TableCell>
                    <TableCell className="text-slate-400 tabular-nums">
                      {assignment.assigned_at?.slice(0, 10) || "-"}
                    </TableCell>
                    <TableCell>
                      {assignment.status === "active" && isAdminOnly ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturnAssignment(assignment)}
                          disabled={returningId === assignment.id}
                        >
                          {returningId === assignment.id
                            ? "Returning..."
                            : "Return"}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-[13px] text-slate-400">
              No assignments found.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

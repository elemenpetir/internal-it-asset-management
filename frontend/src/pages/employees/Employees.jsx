import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { getRoleFromToken } from "../../utils/auth";
import StatusBadge from "../../components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

const emptyForm = {
  name: "",
  email: "",
  employee_number: "",
  department_id: "",
  position: "",
  status: "active",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const role = getRoleFromToken();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      const [empRes, deptRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/employees`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/departments`, { headers }),
      ]);
      const [empResult, deptResult] = await Promise.all([
        empRes.json(),
        deptRes.json(),
      ]);
      if (!empRes.ok)
        throw new Error(empResult.message || "Failed to fetch employees");
      if (!deptRes.ok)
        throw new Error(deptResult.message || "Failed to fetch departments");
      setEmployees(empResult.data);
      setDepartments(deptResult.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode("create");
    setSelectedEmployee(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditModal(employee) {
    setModalMode("edit");
    setSelectedEmployee(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      employee_number: employee.employee_number,
      department_id: String(employee.department_id || ""),
      position: employee.position,
      status: employee.status,
    });
    setDialogOpen(true);
  }

  function getDepartmentName(department_id) {
    const dept = departments.find((d) => d.id === department_id);
    return dept ? dept.name : "-";
  }

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    try {
      setIsSubmitting(true);
      const url =
        modalMode === "create"
          ? `${import.meta.env.VITE_API_URL}/api/employees`
          : `${import.meta.env.VITE_API_URL}/api/employees/${selectedEmployee.id}`;
      const method = modalMode === "create" ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(
          modalMode === "create"
            ? { ...form, department_id: Number(form.department_id) }
            : {
                name: form.name,
                email: form.email,
                position: form.position,
                department_id: Number(form.department_id),
                status: form.status,
              },
        ),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to save employee");
      setDialogOpen(false);
      toast.success(
        modalMode === "create"
          ? "Employee created successfully."
          : "Employee updated successfully.",
      );
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(employee) {
    const confirmed = window.confirm(`Deactivate ${employee.name}?`);
    if (!confirmed) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employees/${employee.id}`,
        { method: "DELETE", headers },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to deactivate employee");
      toast.success("Employee deactivated successfully.");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-100">Employees</h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Employees</h1>
          <p className="mt-0.5 text-[13px] text-slate-400 tabular-nums">
            {employees.length} active employees
          </p>
        </div>
        {role === "asset_admin" && (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Add employee
          </Button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : employees.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-slate-400">
            No employees found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                {role === "asset_admin" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="font-medium text-slate-200">{emp.name}</div>
                    <div className="font-mono text-xs text-slate-400">
                      {emp.employee_number}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">{emp.email}</TableCell>
                  <TableCell className="text-slate-400">
                    {getDepartmentName(emp.department_id)}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {emp.position}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={emp.status} />
                  </TableCell>
                  {role === "asset_admin" && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(emp)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeactivate(emp)}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Add employee" : "Edit employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            {modalMode === "create" && (
              <div className="space-y-1.5">
                <Label>Employee number</Label>
                <Input
                  value={form.employee_number}
                  onChange={(e) =>
                    setField("employee_number", e.target.value)
                  }
                  placeholder="EMP-0008"
                  className="font-mono"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select
                  value={form.department_id}
                  onValueChange={(value) => setField("department_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Input
                  value={form.position}
                  onChange={(e) => setField("position", e.target.value)}
                />
              </div>
            </div>
            {modalMode === "edit" && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : modalMode === "create"
                  ? "Add employee"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

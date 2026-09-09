import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { getRoleFromToken } from "../../utils/auth";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formName, setFormName] = useState("");

  const role = getRoleFromToken();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchDepartments();
  }, []);

  async function fetchDepartments() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/departments`,
        { headers },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to fetch departments");
      setDepartments(result.data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode("create");
    setSelectedDepartment(null);
    setFormName("");
    setDialogOpen(true);
  }

  function openEditModal(department) {
    setModalMode("edit");
    setSelectedDepartment(department);
    setFormName(department.name);
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!formName.trim()) {
      toast.error("Department name is required.");
      return;
    }
    try {
      setIsSubmitting(true);
      const url =
        modalMode === "create"
          ? `${import.meta.env.VITE_API_URL}/api/departments`
          : `${import.meta.env.VITE_API_URL}/api/departments/${selectedDepartment.id}`;
      const method = modalMode === "create" ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to save department");
      setDialogOpen(false);
      toast.success(
        modalMode === "create"
          ? "Department created successfully."
          : "Department updated successfully.",
      );
      fetchDepartments();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(department) {
    const confirmed = window.confirm(
      `Delete department "${department.name}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/departments/${department.id}`,
        { method: "DELETE", headers },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to delete department");
      toast.success("Department deleted successfully.");
      fetchDepartments();
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-900">Departments</h1>
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
          <h1 className="text-xl font-bold text-slate-900">Departments</h1>
          <p className="mt-0.5 text-[13px] text-slate-500 tabular-nums">
            {departments.length} departments
          </p>
        </div>
        {role === "asset_admin" && (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Add department
          </Button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : departments.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-slate-400">
            No departments found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                {role === "asset_admin" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium text-slate-800">
                    {dept.name}
                  </TableCell>
                  <TableCell className="text-slate-500 tabular-nums">
                    {new Date(dept.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  {role === "asset_admin" && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(dept)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(dept)}
                        >
                          Delete
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
              {modalMode === "create" ? "Add department" : "Edit department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-1">
            <Label>Name</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Engineering"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : modalMode === "create"
                  ? "Add department"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

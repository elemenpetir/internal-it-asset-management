import { useState, useEffect } from "react";
import { getRoleFromToken } from "../../utils/auth";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    employee_number: "",
    department_id: "",
    position: "",
    status: "active",
  });

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
        fetch("http://localhost:3000/api/employees", { headers }),
        fetch("http://localhost:3000/api/departments", { headers }),
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
    setForm({
      name: "",
      email: "",
      employee_number: "",
      department_id: "",
      position: "",
      status: "active",
    });
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(employee) {
    setModalMode("edit");
    setSelectedEmployee(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      employee_number: employee.employee_number,
      department_id: employee.department_id,
      position: employee.position,
      status: employee.status,
    });
    setFormError("");
    setShowModal(true);
  }

  function getDepartmentName(department_id) {
    const dept = departments.find((d) => d.id === department_id);
    return dept ? dept.name : "-";
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setFormError("");

      const url =
        modalMode === "create"
          ? "http://localhost:3000/api/employees"
          : `http://localhost:3000/api/employees/${selectedEmployee.id}`;

      const method = modalMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to save employee");

      setShowModal(false);
      setSuccessMessage(
        modalMode === "create"
          ? "Employee created successfully."
          : "Employee updated successfully.",
      );
      fetchData();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(employee) {
    const confirmed = window.confirm(`Deactivate ${employee.name}?`);
    if (!confirmed) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/employees/${employee.id}`,
        {
          method: "DELETE",
          headers,
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to deactivate employee");
      setSuccessMessage("Employee deactivated successfully.");
      fetchData();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Employees"
          description="Manage employee master data."
        />
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Loading employees...
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Employees"
        description="Manage employee master data."
      />

      {successMessage && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-500">
            {employees.length} active employees
          </p>
          {role === "asset_admin" && (
            <button
              onClick={openCreateModal}
              className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Add Employee
            </button>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Name & ID</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Position</th>
              <th className="px-5 py-3">Status</th>
              {role === "asset_admin" && <th className="px-5 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-400">
                      {emp.employee_number}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{emp.email}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {getDepartmentName(emp.department_id)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{emp.position}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={emp.status} />
                  </td>
                  {role === "asset_admin" && (
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivate(emp)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800">
              {modalMode === "create" ? "Add Employee" : "Edit Employee"}
            </h2>

            {formError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              {modalMode === "create" && (
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Employee Number
                  </label>
                  <input
                    type="text"
                    value={form.employee_number}
                    onChange={(e) =>
                      setForm({ ...form, employee_number: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Department
                </label>
                <select
                  value={form.department_id}
                  onChange={(e) =>
                    setForm({ ...form, department_id: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Position
                </label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                />
              </div>
              {modalMode === "edit" && (
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : modalMode === "create"
                    ? "Add Employee"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

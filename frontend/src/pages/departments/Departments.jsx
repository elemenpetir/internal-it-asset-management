import { useState, useEffect } from "react";
import { getRoleFromToken } from "../../utils/auth";
import PageHeader from "../../components/ui/PageHeader";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/departments`, {
        headers,
      });
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
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(department) {
    setModalMode("edit");
    setSelectedDepartment(department);
    setFormName(department.name);
    setFormError("");
    setShowModal(true);
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      setFormError("");

      if (!formName.trim()) {
        setFormError("Department name is required.");
        return;
      }

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

      setShowModal(false);
      setSuccessMessage(
        modalMode === "create"
          ? "Department created successfully."
          : "Department updated successfully.",
      );
      fetchDepartments();
    } catch (error) {
      setFormError(error.message);
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
        {
          method: "DELETE",
          headers,
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to delete department");
      setSuccessMessage("Department deleted successfully.");
      fetchDepartments();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Departments"
          description="Manage department master data."
        />
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Loading departments...
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Departments"
        description="Manage department master data."
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
            {departments.length} departments
          </p>
          {role === "asset_admin" && (
            <button
              onClick={openCreateModal}
              className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              + Add Department
            </button>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Created At</th>
              {role === "asset_admin" && <th className="px-5 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  No departments found.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {dept.name}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(dept.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  {role === "asset_admin" && (
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(dept)}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dept)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-800">
              {modalMode === "create" ? "Add Department" : "Edit Department"}
            </h2>

            {formError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-500">
                Department Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
                placeholder="e.g. Engineering"
              />
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
                    ? "Add Department"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

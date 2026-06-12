import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";

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
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadAssignmentData() {
      try {
        const token = localStorage.getItem("token");

        const [assignmentsResponse, assetsResponse, employeesResponse] =
          await Promise.all([
            fetch("http://localhost:3000/api/asset-assignments", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:3000/api/assets", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:3000/api/employees", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const assignmentsResult = await assignmentsResponse.json();
        const assetsResult = await assetsResponse.json();
        const employeesResult = await employeesResponse.json();

        if (!assignmentsResponse.ok) {
          throw new Error(
            assignmentsResult.message || "Failed to fetch assignments",
          );
        }

        if (!assetsResponse.ok) {
          throw new Error(assetsResult.message || "Failed to fetch assets");
        }

        if (!employeesResponse.ok) {
          throw new Error(
            employeesResult.message || "Failed to fetch employees",
          );
        }

        setAssignments(assignmentsResult.data);
        setAssets(assetsResult.data);
        setEmployees(employeesResult.data);
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setValidationErrors({
      ...validationErrors,
      [name]: "",
    });
  }

  function validateForm() {
    const errors = {};

    if (!formData.asset_id) {
      errors.asset_id = "Asset is required.";
    }

    if (!formData.employee_id) {
      errors.employee_id = "Employee is required.";
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitError("");
      setSuccessMessage("");
      return;
    }

    setValidationErrors({});

    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/asset-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          asset_id: Number(formData.asset_id),
          employee_id: Number(formData.employee_id),
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to assign asset");
      }

      setSuccessMessage("Asset assigned successfully.");

      setFormData({
        asset_id: "",
        employee_id: "",
        notes: "",
      });

      setAssignments([result.data, ...assignments]);

      setAssets(
        assets.map((asset) =>
          asset.id === Number(formData.asset_id)
            ? { ...asset, status: "assigned" }
            : asset,
        ),
      );
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Asset Assignments"
          description="Assign available IT assets to active employees."
        />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading assignment data...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Asset Assignments"
          description="Assign available IT assets to active employees."
        />

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Asset Assignments"
        description="Assign available IT assets to active employees."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h3 className="text-base font-semibold text-slate-900">
            New Assignment
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select an available asset and assign it to an active employee.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Asset
              </label>
              <select
                name="asset_id"
                value={formData.asset_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select available asset</option>
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_code} — {asset.name}
                  </option>
                ))}
              </select>
              {validationErrors.asset_id && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.asset_id}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employee
              </label>
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} — {employee.employee_number}
                  </option>
                ))}
              </select>
              {validationErrors.employee_id && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.employee_id}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Optional assignment notes..."
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            )}

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isSubmitting ? "Assigning..." : "Assign Asset"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900">
            Assignment Overview
          </h3>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Assignments</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {assignments.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Available Assets</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {availableAssets.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Active Employees</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

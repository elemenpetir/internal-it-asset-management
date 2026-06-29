import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRoleFromToken } from "../../utils/auth";
import PageHeader from "../../components/ui/PageHeader";

export default function CreateMaintenance() {
  const navigate = useNavigate();
  const role = getRoleFromToken();

  const [employeeNumber, setEmployeeNumber] = useState("");
  const [assets, setAssets] = useState([]);
  const [assetId, setAssetId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetError, setAssetError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (role === "manager") {
      navigate("/maintenance");
    }
  }, [role, navigate]);

  // Auto-fetch assets for employee
  useEffect(() => {
    if (role !== "employee") return;
    fetchAssets();
  }, [role]);

  async function fetchAssets(empNumber = null) {
    try {
      setIsLoadingAssets(true);
      setAssetError("");
      setAssets([]);
      setAssetId("");

      const token = localStorage.getItem("token");
      const body = empNumber ? { employee_number: empNumber } : undefined;

      const response = await fetch(
        "http://localhost:3000/api/maintenance-requests/my-assets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          ...(body && { body: JSON.stringify(body) }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch assets");
      }

      setAssets(result.data);
    } catch (error) {
      setAssetError(error.message);
    } finally {
      setIsLoadingAssets(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!assetId || !issueDescription) {
      setSubmitError("Asset and issue description are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const token = localStorage.getItem("token");

      const body = {
        asset_id: Number(assetId),
        issue_description: issueDescription,
      };

      if (role === "asset_admin") {
        body.employee_number = employeeNumber;
      }

      const response = await fetch(
        "http://localhost:3000/api/maintenance-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create maintenance request",
        );
      }

      navigate("/maintenance", {
        state: { successMessage: "Maintenance request created successfully." },
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Create Maintenance Request"
        description="Report a technical issue with your assigned equipment."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee Number — admin only */}
            {role === "asset_admin" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Employee Number
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    placeholder="e.g. EMP-0001"
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => fetchAssets(employeeNumber)}
                    disabled={!employeeNumber || isLoadingAssets}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {isLoadingAssets ? "Loading..." : "Search"}
                  </button>
                </div>
                {assetError && (
                  <p className="mt-2 text-sm text-red-600">{assetError}</p>
                )}
              </div>
            )}

            {/* Asset Dropdown */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Asset
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                disabled={assets.length === 0}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {isLoadingAssets
                    ? "Loading assets..."
                    : assets.length === 0
                      ? "No assets available"
                      : "Select your asset"}
                </option>
                {assets.map((asset) => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.asset_code} — {asset.asset_name}
                  </option>
                ))}
              </select>
              {role === "employee" && assetError && (
                <p className="mt-2 text-sm text-red-600">{assetError}</p>
              )}
            </div>

            {/* Issue Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Issue Description
              </label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows="5"
                placeholder="Describe the symptoms, when the issue started, and any troubleshooting steps you've already taken..."
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <Link
                to="/maintenance"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            How it works
          </h3>
          <ol className="mt-4 space-y-4">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Ticket Triage
                </p>
                <p className="text-xs text-slate-500">
                  Our team reviews your request and assigns a technician.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">Assessment</p>
                <p className="text-xs text-slate-500">
                  A technician may contact you for remote diagnostics or to
                  schedule a physical drop-off.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">Resolution</p>
                <p className="text-xs text-slate-500">
                  Your asset is repaired or replaced. You'll receive a
                  notification once the asset is ready.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { formatDateForDisplay } from "../../utils/date";
import { getRoleFromToken } from "../../utils/auth";
import StatusBadge from "../../components/ui/StatusBadge";

function getAgeScore(purchaseDate) {
  const d = new Date(purchaseDate);
  const yrs = (Date.now() - d) / (1000 * 60 * 60 * 24 * 365);
  return yrs < 2 ? 5 : yrs <= 4 ? 15 : 30;
}

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [flashMessage] = useState(location.state?.successMessage || "");
  const [isRetiring, setIsRetiring] = useState(false);
  const [actionError, setActionError] = useState("");
  const [localSuccessMessage, setLocalSuccessMessage] = useState("");
  const [riskScore, setRiskScore] = useState(null);
  const [riskScoreError, setRiskScoreError] = useState("");
  const role = getRoleFromToken();

  useEffect(() => {
    async function fetchAssetDetail() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/assets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Failed to fetch asset detail");
        setAsset(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssetDetail();
  }, [id]);

  useEffect(() => {
    if (role === "employee") return;
    async function fetchRiskScore() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/assets/${id}/risk-score`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        if (response.ok) setRiskScore(result.data);
      } catch {
        setRiskScoreError("Failed to load risk score.");
      }
    }
    fetchRiskScore();
  }, [id, role]);

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  async function handleRetireAsset() {
    const confirmed = window.confirm(
      "Are you sure you want to retire this asset?",
    );
    if (!confirmed) return;
    try {
      setIsRetiring(true);
      setActionError("");
      setLocalSuccessMessage("");
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/assets/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "retired" }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to retire asset");
      setAsset({ ...asset, status: "retired" });
      setLocalSuccessMessage("Asset retired successfully.");
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsRetiring(false);
    }
  }

  if (isLoading) {
    return (
      <section className="p-1">
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
          Loading asset detail...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="p-1">
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  const riskColors = {
    high: {
      badge: "bg-red-100 text-red-700",
      bar: "bg-red-500",
      label: "text-red-600",
    },
    medium: {
      badge: "bg-amber-100 text-amber-700",
      bar: "bg-amber-400",
      label: "text-amber-600",
    },
    low: {
      badge: "bg-green-100 text-green-700",
      bar: "bg-green-500",
      label: "text-green-600",
    },
  };

  const scoreBreakdown = riskScore
    ? [
        {
          label: "Age Score",
          value: getAgeScore(asset.purchase_date),
          max: 30,
        },
        {
          label: "Maintenance Score",
          value:
            riskScore.maintenance_count === 0
              ? 0
              : riskScore.maintenance_count <= 2
                ? 15
                : 30,
          max: 30,
        },
        {
          label: "Assignment Score",
          value:
            riskScore.assignment_count <= 2
              ? 5
              : riskScore.assignment_count <= 5
                ? 10
                : 15,
          max: 15,
        },
        {
          label: "Status Score",
          value:
            asset.status === "under_maintenance"
              ? 20
              : asset.status === "retired"
                ? 40
                : 0,
          max: 40,
        },
      ]
    : [];

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link to="/assets" className="hover:text-slate-600">
              Asset Inventory
            </Link>
            <span>›</span>
            <span className="text-slate-600">{asset.asset_code}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {asset.name}
          </h1>
        </div>

        {asset.status !== "retired" && role === "asset_admin" && (
          <div className="flex gap-2">
            <Link
              to={`/assets/${asset.id}/edit`}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit Asset
            </Link>
            <button
              type="button"
              onClick={handleRetireAsset}
              disabled={isRetiring}
              className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isRetiring ? "Retiring..." : "Retire Asset"}
            </button>
          </div>
        )}
      </div>

      {/* Flash messages */}
      {flashMessage && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {flashMessage}
        </div>
      )}
      {localSuccessMessage && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {localSuccessMessage}
        </div>
      )}
      {actionError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {/* 3-column cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Card 1 — Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Overview
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <div className="mt-1">
                <StatusBadge status={asset.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Asset Code</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                {asset.asset_code}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Category</p>
              <p className="mt-1 text-sm text-slate-700">
                {asset.category_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Location</p>
              <p className="mt-1 text-sm text-slate-700">{asset.location}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Purchase Date</p>
              <p className="mt-1 text-sm text-slate-700">
                {formatDateForDisplay(asset.purchase_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 — Specifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Specifications
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400">Brand</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {asset.brand}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Model</p>
              <p className="mt-1 text-sm text-slate-700">{asset.model}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Serial Number</p>
              <p className="mt-1 font-mono text-sm text-slate-700">
                {asset.serial_number}
              </p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">Notes</p>
              <p className="mt-1 text-sm text-slate-600">
                {asset.notes || "No notes provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 — Risk Analysis */}
        {riskScore ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Risk Analysis
            </p>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-bold text-slate-900">
                {riskScore.risk_score}
              </span>
              <div className="mb-1">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${riskColors[riskScore.risk_level]?.badge}`}
                >
                  {riskScore.risk_level} risk
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {scoreBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-700">
                      +{item.value}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full ${riskColors[riskScore.risk_level]?.bar}`}
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-xs text-slate-500">
                {riskScore.recommendation}
              </p>
            </div>

            <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
              <span>
                {riskScore.maintenance_count} maintenance request
                {riskScore.maintenance_count !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                {riskScore.assignment_count} assignment
                {riskScore.assignment_count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mt-4 text-sm text-slate-400">
              {riskScoreError || "Not available for your role."}
            </p>
          </div>
        )}
      </div>

      {/* Retired warning */}
      {asset.status === "retired" && (
        <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          This asset is retired and kept for historical records. Editing is
          disabled.
        </div>
      )}

      {/* Back link */}
      <div className="mt-6">
        <Link
          to="/assets"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to Asset Inventory
        </Link>
      </div>
    </section>
  );
}

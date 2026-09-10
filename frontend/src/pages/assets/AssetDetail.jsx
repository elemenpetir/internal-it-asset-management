import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { formatDateForDisplay } from "../../utils/date";
import { getRoleFromToken } from "../../utils/auth";
import StatusBadge from "../../components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
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

function getAgeScore(purchaseDate) {
  // B23: unknown purchase date scores 0 (unknown), never 30 (old)
  if (!purchaseDate) return 0;
  const d = new Date(purchaseDate);
  const yrs = (Date.now() - d) / (1000 * 60 * 60 * 24 * 365);
  return yrs < 2 ? 5 : yrs <= 4 ? 15 : 30;
}

const riskBadgeClass = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-green-500/15 text-green-400",
};

function DetailItem({ label, children, mono = false }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <div
        className={`mt-1 text-[13px] text-slate-300 ${mono ? "font-mono" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRetiring, setIsRetiring] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const role = getRoleFromToken();

  useEffect(() => {
    async function fetchAssetDetail() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assets/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
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
    if (role === "employee") {
      setAssignmentsLoading(false);
      return;
    }
    // B21: abort stale requests when id changes fast (dashboard hopping)
    const controller = new AbortController();
    const signal = controller.signal;
    async function fetchRiskScore() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assets/${id}/risk-score`,
          { headers: { Authorization: `Bearer ${token}` }, signal },
        );
        const result = await response.json();
        if (response.ok) setRiskScore(result.data);
      } catch (error) {
        // silent fail, risk section hidden (abort is not an error)
        if (error.name !== "AbortError") setRiskScoreError("Failed to load risk score.");
      }
    }
    async function fetchAssignments() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assets/${id}/assignments`,
          { headers: { Authorization: `Bearer ${token}` }, signal },
        );
        const result = await response.json();
        if (response.ok) setAssignments(result.data);
      } catch {
        // silent fail, table empty
      } finally {
        if (!signal.aborted) setAssignmentsLoading(false);
      }
    }
    fetchRiskScore();
    fetchAssignments();
    return () => controller.abort();
  }, [id, role]);

  async function handleRetireAsset() {
    const confirmed = window.confirm(
      "Are you sure you want to retire this asset?",
    );
    if (!confirmed) return;
    try {
      setIsRetiring(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/assets/${id}/status`,
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
      toast.success("Asset retired successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRetiring(false);
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  const scoreBreakdown = riskScore
    ? [
        {
          label: "Age",
          value: getAgeScore(asset.purchase_date),
          max: 30,
        },
        {
          label: "Maintenance",
          value:
            riskScore.maintenance_count === 0
              ? 0
              : riskScore.maintenance_count <= 2
                ? 15
                : 30,
          max: 30,
        },
        {
          label: "Assignment",
          value:
            riskScore.assignment_count <= 2
              ? 5
              : riskScore.assignment_count <= 5
                ? 10
                : 15,
          max: 15,
        },
        {
          label: "Status",
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
            <Link to="/assets" className="hover:text-slate-400">
              Inventory
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-400">{asset.asset_code}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-slate-100">
            {asset.name}
          </h1>
        </div>

        {asset.status !== "retired" && role === "asset_admin" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/assets/${asset.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleRetireAsset}
              disabled={isRetiring}
            >
              {isRetiring ? "Retiring..." : "Retire"}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Overview
          </p>
          <div className="mt-3 space-y-3">
            <DetailItem label="Status">
              <StatusBadge status={asset.status} />
            </DetailItem>
            <DetailItem label="Asset code" mono>
              {asset.asset_code}
            </DetailItem>
            <DetailItem label="Category">{asset.category_name}</DetailItem>
            <DetailItem label="Location">{asset.location}</DetailItem>
            <DetailItem label="Purchase date">
              <span className="tabular-nums">
                {formatDateForDisplay(asset.purchase_date)}
              </span>
            </DetailItem>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Specifications
          </p>
          <div className="mt-3 space-y-3">
            <DetailItem label="Brand">{asset.brand}</DetailItem>
            <DetailItem label="Model">{asset.model}</DetailItem>
            <DetailItem label="Serial number" mono>
              {asset.serial_number}
            </DetailItem>
            <DetailItem label="Notes">
              {asset.notes || <span className="text-slate-400">-</span>}
            </DetailItem>
          </div>
        </div>

        {riskScore && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Risk analysis
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="text-4xl font-bold text-slate-100 tabular-nums">
                {riskScore.risk_score}
              </span>
              <Badge className={riskBadgeClass[riskScore.risk_level]}>
                {riskScore.risk_level}
              </Badge>
            </div>
            <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-muted">
              {scoreBreakdown.map((item) => (
                <div
                  key={item.label}
                  className={
                    riskScore.risk_level === "high"
                      ? "bg-red-500"
                      : riskScore.risk_level === "medium"
                        ? "bg-amber-400"
                        : "bg-green-500"
                  }
                  style={{ width: `${(item.value / 115) * 100}%` }}
                  title={`${item.label}: +${item.value}`}
                />
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              {scoreBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between text-xs text-slate-400"
                >
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-300 tabular-nums">
                    +{item.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-slate-400">
              {riskScore.recommendation}
            </p>
          </div>
        )}
      </div>

      {asset.status === "retired" && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          Retired. Kept for historical records; editing is disabled.
        </div>
      )}

      {role !== "employee" && (
        <div className="mt-4">
          <h2 className="text-base font-semibold text-slate-100">
            Assignment history
          </h2>
          <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
            {assignmentsLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : assignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="font-medium text-slate-200">
                          {a.employee_name}
                        </div>
                        <div className="font-mono text-xs text-slate-400">
                          {a.employee_number}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 tabular-nums">
                        {a.assigned_at ? a.assigned_at.slice(0, 10) : "-"}
                      </TableCell>
                      <TableCell className="text-slate-400 tabular-nums">
                        {a.returned_at ? a.returned_at.slice(0, 10) : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="p-8 text-center text-[13px] text-slate-400">
                No assignment history found.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link
          to="/assets"
          // B29: carry the list context back so filter/search/page survive
          state={
            location.state?.fromList
              ? { fromList: location.state.fromList }
              : undefined
          }
          className="inline-flex items-center gap-1 text-[13px] text-slate-400 hover:text-slate-300"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to inventory
        </Link>
      </div>
    </section>
  );
}

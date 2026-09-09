import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRoleFromToken } from "../../utils/auth";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "../../components/ui/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CATEGORY_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#22d3ee", "#f87171", "#94a3b8"];

const riskBadgeClass = {
  high: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-green-500/15 text-green-400",
};

function SectionHeader({ title, description }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      {description && (
        <p className="mt-0.5 text-[13px] text-slate-400">{description}</p>
      )}
    </div>
  );
}

function SummaryStrip({ items }) {
  return (
    <div className="flex flex-wrap items-stretch divide-x divide-border rounded-lg border border-border bg-card">
      {items.map((item) => (
        <div key={item.title} className="min-w-36 flex-1 px-5 py-3.5">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {item.title}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-100 tabular-nums">
            {item.value}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function AssetCell({ asset }) {
  return (
    <div>
      <Link
        to={`/assets/${asset.asset_id}`}
        className="font-medium text-link hover:underline"
      >
        {asset.asset_name}
      </Link>
      <p className="font-mono text-xs text-slate-400">{asset.asset_code}</p>
    </div>
  );
}

function RiskCell({ score, level }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-bold text-slate-100 tabular-nums">{score}</span>
      <Badge className={riskBadgeClass[level] || riskBadgeClass.low}>
        {level}
      </Badge>
    </span>
  );
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [summaryItems, setSummaryItems] = useState([]);
  const [highRiskAssets, setHighRiskAssets] = useState([]);
  const [assetsByCategory, setAssetsByCategory] = useState([]);
  const [assetsByDepartment, setAssetsByDepartment] = useState([]);
  const [maintenanceSummary, setMaintenanceSummary] = useState([]);
  const [replacementCandidates, setReplacementCandidates] = useState([]);
  const role = getRoleFromToken();

  useEffect(() => {
    async function fetchAdminOverview() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [
        overviewRes,
        highRiskRes,
        byCategoryRes,
        byDepartmentRes,
        maintenanceRes,
        replacementRes,
      ] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/overview`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/high-risk-assets`, {
          headers,
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/assets-by-category`, {
          headers,
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/assets-by-department`, {
          headers,
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/maintenance-summary`, {
          headers,
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/replacement-candidates`, {
          headers,
        }),
      ]);

      const [
        overviewResult,
        highRiskResult,
        byCategoryResult,
        byDepartmentResult,
        maintenanceResult,
        replacementResult,
      ] = await Promise.all([
        overviewRes.json(),
        highRiskRes.json(),
        byCategoryRes.json(),
        byDepartmentRes.json(),
        maintenanceRes.json(),
        replacementRes.json(),
      ]);

      if (!overviewRes.ok)
        throw new Error(overviewResult.message || "Failed to fetch overview");

      const data = overviewResult.data;

      if (!highRiskRes.ok)
        throw new Error(
          highRiskResult.message || "Failed to fetch high risk assets",
        );
      if (!byCategoryRes.ok)
        throw new Error(
          byCategoryResult.message || "Failed to fetch assets by category",
        );
      if (!byDepartmentRes.ok)
        throw new Error(
          byDepartmentResult.message || "Failed to fetch assets by department",
        );
      if (!maintenanceRes.ok)
        throw new Error(
          maintenanceResult.message || "Failed to fetch maintenance summary",
        );
      if (!replacementRes.ok)
        throw new Error(
          replacementResult.message || "Failed to fetch replacement candidates",
        );

      setHighRiskAssets(highRiskResult.data);
      setAssetsByCategory(byCategoryResult.data);
      setAssetsByDepartment(byDepartmentResult.data);
      setMaintenanceSummary(maintenanceResult.data);
      setReplacementCandidates(replacementResult.data);

      return [
        {
          title: "Total assets",
          value: data.total_assets,
          description: "All registered assets",
        },
        {
          title: "Available",
          value: data.available,
          description: "Ready for assignment",
        },
        {
          title: "Assigned",
          value: data.assigned,
          description: "In use by employees",
        },
        {
          title: "Maintenance",
          value: data.under_maintenance,
          description: "Undergoing repair",
        },
      ];
    }

    async function fetchEmployeeOverview() {
      const token = localStorage.getItem("token");

      const [assetsResponse, requestsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/maintenance-requests/my-assets`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/maintenance-requests/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const assetsResult = await assetsResponse.json();
      const requestsResult = await requestsResponse.json();

      const myAssets = assetsResponse.ok ? assetsResult.data : [];
      const myRequests = requestsResponse.ok ? requestsResult.data : [];

      const activeRequests = myRequests.filter(
        (r) => r.status === "reported" || r.status === "in_progress",
      ).length;

      const completedRequests = myRequests.filter(
        (r) => r.status === "completed",
      ).length;

      return [
        {
          title: "My assets",
          value: myAssets.length,
          description: "Currently assigned to you",
        },
        {
          title: "Active requests",
          value: activeRequests,
          description: "Awaiting resolution",
        },
        {
          title: "Completed",
          value: completedRequests,
          description: "Resolved requests",
        },
      ];
    }

    async function loadDashboard() {
      try {
        const items =
          role === "employee"
            ? await fetchEmployeeOverview()
            : await fetchAdminOverview();

        setSummaryItems(items);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [role]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
      <p className="mt-0.5 text-[13px] text-slate-400">
        {role === "employee"
          ? "Your assigned assets and maintenance requests."
          : "Asset status, maintenance activity, and risk indicators."}
      </p>

      <div className="mt-4">
        <SummaryStrip items={summaryItems} />
      </div>

      {role !== "employee" && (
        <>
          <div className="mt-6">
            <SectionHeader
              title="High risk assets"
              description="Flagged for maintenance or replacement review."
            />
            <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
              {highRiskAssets.length === 0 ? (
                <p className="p-4 text-[13px] text-slate-400">
                  No high risk assets found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highRiskAssets.slice(0, 5).map((asset) => (
                      <TableRow key={asset.asset_id}>
                        <TableCell>
                          <AssetCell asset={asset} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={asset.status} />
                        </TableCell>
                        <TableCell>
                          <RiskCell
                            score={asset.risk_score}
                            level={asset.risk_level}
                          />
                        </TableCell>
                        <TableCell className="text-slate-400 capitalize">
                          {asset.recommendation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div className="mt-6">
            <SectionHeader
              title="Replacement candidates"
              description="Over 2 years old with medium or high risk score."
            />
            <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
              {replacementCandidates.length === 0 ? (
                <p className="p-4 text-[13px] text-slate-400">
                  No replacement candidates found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Purchased</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {replacementCandidates.slice(0, 5).map((asset) => (
                      <TableRow key={asset.asset_id}>
                        <TableCell>
                          <AssetCell asset={asset} />
                        </TableCell>
                        <TableCell className="text-slate-400 tabular-nums">
                          {asset.purchase_date
                            ? asset.purchase_date.toString().slice(0, 10)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <RiskCell
                            score={asset.risk_score}
                            level={asset.risk_level}
                          />
                        </TableCell>
                        <TableCell className="text-slate-400 capitalize">
                          {asset.recommendation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
              <SectionHeader
                title="Assets by category"
                description="Active assets per category."
              />
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetsByCategory}
                      dataKey="total_assets"
                      nameKey="category_name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {assetsByCategory.map((_, index) => (
                        <Cell
                          key={index}
                          fill={
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#cbd5e1" }} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 lg:col-span-3">
              <SectionHeader
                title="Assets by department"
                description="Active assignments per department."
              />
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assetsByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="department_name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#cbd5e1" }} />
                    <Bar
                      dataKey="total_assets"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <SectionHeader
              title="Maintenance trend"
              description="Monthly requests over the last 6 months."
            />
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...maintenanceSummary].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#f1f5f9" }} itemStyle={{ color: "#cbd5e1" }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ongoing"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="canceled"
                    stroke="#64748b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator className="mt-6" />
          <p className="mt-2 text-xs text-slate-400">
            Risk levels: low (0–30), medium (31–60), high (61+).
          </p>
        </>
      )}
    </section>
  );
}

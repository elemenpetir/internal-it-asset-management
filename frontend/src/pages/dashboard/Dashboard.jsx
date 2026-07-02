import DashboardCard from "../../components/ui/DashboardCard";
import PageHeader from "../../components/ui/PageHeader";
import { useEffect, useState } from "react";
import { getRoleFromToken } from "../../utils/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
} from "recharts";

const PIE_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboardCards, setDashboardCards] = useState([]);
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
        fetch("http://localhost:3000/api/analytics/overview", { headers }),
        fetch("http://localhost:3000/api/analytics/high-risk-assets", {
          headers,
        }),
        fetch("http://localhost:3000/api/analytics/assets-by-category", {
          headers,
        }),
        fetch("http://localhost:3000/api/analytics/assets-by-department", {
          headers,
        }),
        fetch("http://localhost:3000/api/analytics/maintenance-summary", {
          headers,
        }),
        fetch("http://localhost:3000/api/analytics/replacement-candidates", {
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
      setAssetsByCategory(
        byCategoryResult.data.map((item, index) => ({
          ...item,
          fill: PIE_COLORS[index % PIE_COLORS.length],
        })),
      );
      setAssetsByDepartment(byDepartmentResult.data);
      setMaintenanceSummary(maintenanceResult.data);
      setReplacementCandidates(replacementResult.data);

      return [
        {
          title: "Total Assets",
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
          description: "Currently used by employees",
        },
        {
          title: "Under Maintenance",
          value: data.under_maintenance,
          description: "Undergoing active repair",
        },
      ];
    }

    async function fetchEmployeeOverview() {
      const token = localStorage.getItem("token");

      const [assetsResponse, requestsResponse] = await Promise.all([
        fetch("http://localhost:3000/api/maintenance-requests/my-assets", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/maintenance-requests/my-requests", {
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
          title: "My Assets",
          value: myAssets.length,
          description: "Assets currently assigned to you",
        },
        {
          title: "Active Requests",
          value: activeRequests,
          description: "Maintenance requests in progress",
        },
        {
          title: "Completed Requests",
          value: completedRequests,
          description: "Maintenance requests resolved",
        },
      ];
    }

    async function loadDashboard() {
      try {
        const cards =
          role === "employee"
            ? await fetchEmployeeOverview()
            : await fetchAdminOverview();

        setDashboardCards(cards);
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
      <section>
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
          Loading dashboard data...
        </p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Dashboard Overview"
          description="Monitor asset status, assignment activity, and risk indicators."
        />
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Dashboard Overview"
        description={
          role === "employee"
            ? "Track your assigned assets and maintenance requests."
            : "Monitor asset status, assignment activity, and risk indicators."
        }
      />

      <div
        className={`mt-6 grid gap-4 md:grid-cols-2 ${role === "employee" ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
      >
        {dashboardCards.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
          />
        ))}
      </div>

      {role !== "employee" && (
        <>
          {/* High Risk Assets */}
          <div className="mt-8">
            <h2 className="text-base font-semibold text-slate-800">
              High Risk Assets
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Assets flagged for maintenance or replacement review.
            </p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {highRiskAssets.length === 0 ? (
                <p className="p-5 text-sm text-slate-400">
                  No high risk assets found.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3">Asset</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Risk Score</th>
                      <th className="px-5 py-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {highRiskAssets.slice(0, 5).map((asset) => (
                      <tr key={asset.asset_id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800">
                            {asset.asset_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {asset.asset_code}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {asset.status}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-bold text-red-600">
                              {asset.risk_score}
                            </span>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                              high
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {asset.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Replacement Candidates */}
          <div className="mt-8">
            <h2 className="text-base font-semibold text-slate-800">
              Replacement Candidates
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Assets over 2 years old with medium or high risk score.
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {replacementCandidates.length === 0 ? (
                <p className="p-5 text-sm text-slate-400">
                  No replacement candidates found.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3">Asset</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Purchase Date</th>
                      <th className="px-5 py-3">Risk Score</th>
                      <th className="px-5 py-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {replacementCandidates.slice(0, 5).map((asset) => (
                      <tr key={asset.asset_id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800">
                            {asset.asset_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {asset.asset_code}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {asset.status}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {asset.purchase_date
                            ? asset.purchase_date.toString().slice(0, 10)
                            : "-"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`font-bold ${asset.risk_level === "high" ? "text-red-600" : "text-amber-600"}`}
                            >
                              {asset.risk_score}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                asset.risk_level === "high"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {asset.risk_level}
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {asset.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Charts row */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Assets by Category */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">
                Assets by Category
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Distribution of active assets per category.
              </p>
              <div className="mt-4">
                <PieChart width={340} height={220}>
                  <Pie
                    data={assetsByCategory}
                    dataKey="total_assets"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category_name, total_assets }) =>
                      `${category_name} (${total_assets})`
                    }
                  ></Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>

            {/* Assets by Department */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">
                Assets by Department
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Active asset assignments per department.
              </p>
              <div className="mt-4">
                <BarChart width={340} height={220} data={assetsByDepartment}>
                  <XAxis dataKey="department_name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="total_assets"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </div>
            </div>
          </div>

          {/* Maintenance Summary */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">
              Maintenance Trend
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Monthly maintenance requests over the last 6 months.
            </p>
            <div className="mt-4">
              <BarChart
                width={700}
                height={220}
                data={[...maintenanceSummary].reverse()}
              >
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ongoing" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="canceled" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

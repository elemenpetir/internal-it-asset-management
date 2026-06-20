import DashboardCard from "../../components/ui/DashboardCard";
import PageHeader from "../../components/ui/PageHeader";
import { useEffect, useState } from "react";
import { getRoleFromToken } from "../../utils/auth";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dashboardCards, setDashboardCards] = useState([]);
  const role = getRoleFromToken();

  useEffect(() => {
    async function fetchAdminOverview() {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/analytics/overview",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch overview");
      }

      const data = result.data;
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
        className={`mt-6 grid gap-4 md:grid-cols-2 ${
          role === "employee" ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
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
    </section>
  );
}

import DashboardCard from "../../components/ui/DashboardCard";
import PageHeader from "../../components/ui/PageHeader";
import { useEffect, useState } from "react";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [overview, setOverview] = useState([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3000/api/analytics/overview",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.message || "failed to fetch analytics overview",
          );
        }

        const data = result.data;
        const cards = [
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

        setOverview(cards);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

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
        description="Monitor asset status, assignment activity, and risk indicators."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overview.map((card) => (
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

export default Dashboard;

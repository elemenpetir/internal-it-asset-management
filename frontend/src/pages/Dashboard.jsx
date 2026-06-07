import DashboardCard from "../components/DashboardCard";
import PageHeader from '../components/PageHeader'
import { useEffect, useState } from "react";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardCards, setDashboardCards] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const dummyCards = [
        {
          title: "Total Assets",
          value: "1,284",
          description: "Across 14 global locations",
        },
        {
          title: "Available",
          value: "156",
          description: "Ready for assignment",
        },
        {
          title: "Assigned",
          value: "1,104",
          description: "Currently used by employees",
        },
        {
          title: "Maintenance",
          value: "24",
          description: "Undergoing active repair",
        },
      ];

      setDashboardCards(dummyCards);
      setIsLoading(false);
    }, 1000);
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

  return (
    <section>
      <PageHeader
        title="Dashboard Overview"
        description="Monitor asset status, assignment activity, and risk indicators."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

export default Dashboard;

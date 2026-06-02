import DashboardCard from "../components/DashboardCard";

function Dashboard() {
  return (
    <section>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Dashboard Overview
        </h2>
        <p className="mt-2 text-slate-600">
          Monitor asset status, assignment activity, and risk indicators.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Assets"
          value="1,284"
          description="Across 14 global locations"
        />

        <DashboardCard
          title="Available"
          value="156"
          description="Ready for assignment"
        />

        <DashboardCard
          title="Assigned"
          value="1,104"
          description="Currently used by employees"
        />

        <DashboardCard
          title="Maintenance"
          value="24"
          description="Undergoing active repair"
        />
      </div>
    </section>
  );
}

export default Dashboard;

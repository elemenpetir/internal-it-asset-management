import DashboardCard from "../components/DashboardCard";
import { useState } from "react";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (isLoading) {
    return (
      <section>
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
          Loading dashboard data...
        </p>
      </section>
    );
  }

  if (hasError) {
    return (
      <section>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          Failed to load dashboard data.
        </div>
      </section>
    );
  }
  
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

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setIsLoading(true)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Simulate Loading
        </button>

        <button
          onClick={() => setHasError(true)}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Simulate Error
        </button>
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

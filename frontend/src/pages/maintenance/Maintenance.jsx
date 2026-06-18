import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Maintenance() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadMaintenanceData() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3000/api/maintenance-requests",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch maintenance requests",
          );
        }
        setMaintenanceRequests(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadMaintenanceData();
  }, []);

  const reportedCount = maintenanceRequests.filter(
    (r) => r.status === "reported",
  ).length;
  const inProgressCount = maintenanceRequests.filter(
    (r) => r.status === "in_progress",
  ).length;
  const completedCount = maintenanceRequests.filter(
    (r) => r.status === "completed",
  ).length;

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Maintenance Requests"
          description="Track and manage asset maintenance requests."
        />
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading maintenance data...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Maintenance Requests"
          description="Track and manage asset maintenance requests."
        />
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Maintenance Requests"
        description="Track and manage asset maintenance requests."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reported</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {reportedCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {inProgressCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {completedCount}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Asset</th>
                <th className="px-4 py-3 font-semibold">Requested By</th>
                <th className="px-4 py-3 font-semibold">Issue Description</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {maintenanceRequests.length > 0 ? (
                maintenanceRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-bold">
                      <Link to={`/maintenance/${request.id}`}>
                        #{request.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {request.asset_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {request.asset_code || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <div className="font-medium text-slate-800">
                        {request.requested_by_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {request.employee_number || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-60 truncate">
                      {request.issue_description}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {request.created_at
                        ? request.created_at.slice(0, 10)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={request.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No maintenance requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

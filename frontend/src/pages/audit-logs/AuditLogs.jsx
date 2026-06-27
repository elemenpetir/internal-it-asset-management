import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import { getRoleFromToken } from "../../utils/auth";

function formatActionBadge(action) {
  const styles = {
    CREATE_ASSET: "bg-green-100 text-green-700",
    UPDATE_ASSET: "bg-blue-100 text-blue-700",
    UPDATE_ASSET_STATUS: "bg-amber-100 text-amber-700",
    ASSIGN_ASSET: "bg-indigo-100 text-indigo-700",
    RETURN_ASSET: "bg-slate-100 text-slate-700",
    MAINTENANCE_CREATED: "bg-purple-100 text-purple-700",
    UPDATE_STATUS: "bg-orange-100 text-orange-700",
  };
  return styles[action] || "bg-slate-100 text-slate-700";
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function ChangeDetail({ oldValue, newValue }) {
  const oldData = parseJson(oldValue);
  const newData = parseJson(newValue);

  if (!newData) return <span className="text-slate-400 text-sm">—</span>;

  if (!oldData) {
    return (
      <div className="text-sm text-slate-600">
        {Object.entries(newData)
          .slice(0, 3)
          .map(([key, val]) => (
            <div key={key}>
              <span className="font-medium text-slate-500">{key}:</span>{" "}
              <span className="truncate block max-w-40">
                {String(val).slice(0, 30)}
              </span>
            </div>
          ))}
      </div>
    );
  }

  const changedKeys = Object.keys(newData).filter(
    (key) => String(oldData[key]) !== String(newData[key]),
  );

  if (changedKeys.length === 0)
    return <span className="text-slate-400 text-sm">No changes</span>;

  return (
    <div className="text-sm space-y-1">
      {changedKeys.slice(0, 3).map((key) => (
        <div key={key} className="flex items-center gap-1">
          <span className="font-medium text-slate-500">{key}:</span>
          <span className="text-red-500 line-through truncate max-w-15 block">
            {String(oldData[key]).slice(0, 20)}...
          </span>
          <span className="text-slate-400">→</span>
          <span className="text-green-600 truncate max-w-15 block">
            {String(newData[key]).slice(0, 20)}...
          </span>
        </div>
      ))}
    </div>
  );
}

function formatEntityType(entityType) {
  const labels = {
    asset: "Asset",
    asset_assignment: "Assignment",
    maintenance_requests: "Maintenance",
  };
  return labels[entityType] || entityType;
}

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const role = getRoleFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "employee") {
      navigate("/");
    }
  }, [role, navigate]);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/audit-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch audit logs");
        }
        setAuditLogs(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Audit Logs"
          description="Monitor system-wide changes and asset lifecycle transitions."
        />
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading audit logs...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Audit Logs"
          description="Monitor system-wide changes and asset lifecycle transitions."
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
        title="Audit Logs"
        description="Monitor system-wide changes and asset lifecycle transitions."
      />

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium uppercase text-slate-400">
            Total Logs
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {auditLogs.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium uppercase text-slate-400">
            Asset Changes
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {auditLogs.filter((l) => l.entity_type === "asset").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium uppercase text-slate-400">
            Assignments
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {
              auditLogs.filter((l) => l.entity_type === "asset_assignment")
                .length
            }
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium uppercase text-slate-400">
            Maintenance
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {
              auditLogs.filter((l) => l.entity_type === "maintenance_requests")
                .length
            }
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-sm uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Entity</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Change Detail</th>
                <th className="px-4 py-3 font-semibold">Changed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {log.created_at?.slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-700">
                        {formatEntityType(log.entity_type)}
                      </div>
                      <div className="text-sm text-slate-400">
                        #{log.entity_id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-sm font-semibold ${formatActionBadge(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-65">
                      <ChangeDetail
                        oldValue={log.old_value}
                        newValue={log.new_value}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {log.changed_by_name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No audit logs found.
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

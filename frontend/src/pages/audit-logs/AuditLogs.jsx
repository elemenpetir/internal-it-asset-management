import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getRoleFromToken } from "../../utils/auth";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatActionBadge(action) {
  const styles = {
    CREATE_ASSET: "bg-green-500/15 text-green-400",
    UPDATE_ASSET: "bg-blue-500/15 text-blue-400",
    UPDATE_ASSET_STATUS: "bg-amber-500/15 text-amber-400",
    ASSIGN_ASSET: "bg-blue-500/15 text-blue-400",
    RETURN_ASSET: "bg-slate-500/15 text-slate-400",
    MAINTENANCE_CREATED: "bg-cyan-500/15 text-cyan-400",
    UPDATE_STATUS: "bg-amber-500/15 text-amber-400",
  };
  return styles[action] || "bg-slate-500/15 text-slate-400";
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// Foreign keys stored as technical IDs in old_value/new_value JSON.
// Resolve the known ones to human-readable labels via lookup maps.
function resolveValue(key, value, lookups) {
  if (value === null || value === undefined) return "-";
  const id = String(value);
  if (key === "asset_id" && lookups.assets.has(id))
    return lookups.assets.get(id);
  if (
    (key === "employee_id" || key === "requested_by") &&
    lookups.employees.has(id)
  )
    return lookups.employees.get(id);
  if (key === "category_id" && lookups.categories.has(id))
    return lookups.categories.get(id);
  if (
    (key === "assigned_by" || key === "handled_by" || key === "changed_by") &&
    lookups.users.has(id)
  )
    return lookups.users.get(id);
  if (
    (key === "assigned_by" || key === "handled_by" || key === "changed_by") &&
    /^\d+$/.test(id)
  )
    return `User #${id}`;
  return String(value).slice(0, 30);
}

function ChangeDetail({ oldValue, newValue, lookups }) {
  const oldData = parseJson(oldValue);
  const newData = parseJson(newValue);

  if (!newData) return <span className="text-[13px] text-slate-300">-</span>;

  if (!oldData) {
    return (
      <div className="text-[13px] text-slate-400">
        {Object.entries(newData)
          .slice(0, 3)
          .map(([key, val]) => (
            <div key={key} className="truncate">
              <span className="text-slate-400">{key}: </span>
              {resolveValue(key, val, lookups)}
            </div>
          ))}
      </div>
    );
  }

  const changedKeys = Object.keys(newData).filter(
    (key) => String(oldData[key]) !== String(newData[key]),
  );

  if (changedKeys.length === 0)
    return <span className="text-[13px] text-slate-300">No changes</span>;

  return (
    <div className="space-y-0.5 text-[13px]">
      {changedKeys.slice(0, 3).map((key) => (
        <div key={key} className="flex items-center gap-1">
          <span className="shrink-0 text-slate-400">{key}:</span>
          <span className="truncate text-red-500 line-through">
            {resolveValue(key, oldData[key], lookups).slice(0, 20)}
          </span>
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
          <span className="truncate text-green-400">
            {resolveValue(key, newData[key], lookups).slice(0, 20)}
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
  const [lookups, setLookups] = useState({
    assets: new Map(),
    employees: new Map(),
    categories: new Map(),
    users: new Map(),
  });
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
        const headers = { Authorization: `Bearer ${token}` };
        const base = import.meta.env.VITE_API_URL;
        const [logsRes, assetsRes, employeesRes, categoriesRes, usersRes] =
          await Promise.all([
            fetch(`${base}/api/audit-logs`, { headers }),
            fetch(`${base}/api/assets?limit=all`, { headers }),
            fetch(`${base}/api/employees`, { headers }),
            fetch(`${base}/api/asset-categories`, { headers }),
            fetch(`${base}/api/users`, { headers }),
          ]);
        const result = await logsRes.json();
        if (!logsRes.ok) {
          throw new Error(result.message || "Failed to fetch audit logs");
        }
        setAuditLogs(result.data);
        // ponytail: best-effort lookups, table still renders on failure
        const [assetsResult, employeesResult, categoriesResult, usersResult] =
          await Promise.all([
            assetsRes.ok ? assetsRes.json() : null,
            employeesRes.ok ? employeesRes.json() : null,
            categoriesRes.ok ? categoriesRes.json() : null,
            usersRes.ok ? usersRes.json() : null,
          ]);
        setLookups({
          assets: new Map(
            (assetsResult?.data || []).map((a) => [
              String(a.id),
              `${a.asset_code} (${a.name})`,
            ]),
          ),
          employees: new Map(
            (employeesResult?.data || []).map((e) => [
              String(e.id),
              `${e.name} (${e.employee_number})`,
            ]),
          ),
          categories: new Map(
            (categoriesResult?.data || []).map((c) => [String(c.id), c.name]),
          ),
          users: new Map(
            (usersResult?.data || []).map((u) => [String(u.id), u.name]),
          ),
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-100">Audit log</h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  const counts = {
    total: auditLogs.length,
    asset: auditLogs.filter((l) => l.entity_type === "asset").length,
    assignment: auditLogs.filter((l) => l.entity_type === "asset_assignment")
      .length,
    maintenance: auditLogs.filter(
      (l) => l.entity_type === "maintenance_requests",
    ).length,
  };

  return (
    <section>
      <h1 className="text-xl font-bold text-slate-100">Audit log</h1>
      <p className="mt-0.5 text-[13px] text-slate-400">
        System-wide changes and asset lifecycle transitions.
      </p>

      <div className="mt-4 flex divide-x divide-border rounded-lg border border-border bg-card">
        {[
          ["Total", counts.total],
          ["Assets", counts.asset],
          ["Assignments", counts.assignment],
          ["Maintenance", counts.maintenance],
        ].map(([label, count]) => (
          <div key={label} className="flex-1 px-4 py-2.5">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {label}
            </p>
            <p className="text-lg font-bold text-slate-100 tabular-nums">
              {count}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : auditLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Changed by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-slate-400 tabular-nums whitespace-nowrap">
                    {log.created_at?.slice(0, 16).replace("T", " ")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-300">
                      {formatEntityType(log.entity_type)}
                    </div>
                    <div className="font-mono text-xs text-slate-400 tabular-nums">
                      #{log.entity_id}
                    </div>
                    {log.entity_label && (
                      <div className="text-xs text-slate-400">
                        {log.entity_label}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={formatActionBadge(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-65">
                    <ChangeDetail
                      oldValue={log.old_value}
                      newValue={log.new_value}
                      lookups={lookups}
                    />
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {log.changed_by_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="p-8 text-center text-[13px] text-slate-400">
            No audit logs found.
          </p>
        )}
      </div>
    </section>
  );
}

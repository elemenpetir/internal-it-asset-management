import { getRoleFromToken } from "../../utils/auth";

const roleLabels = {
  asset_admin: "Asset Admin",
  manager: "Manager",
  employee: "Employee",
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Topbar() {
  const name = localStorage.getItem("name") || "User";
  const role = getRoleFromToken();

  return (
    <header className="border-b border-border bg-white px-6 py-3">
      <div className="flex items-center justify-end gap-3">
        <div className="text-right">
          <p className="text-[13px] font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{roleLabels[role] || role}</p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {getInitials(name)}
        </div>
      </div>
    </header>
  );
}

export default Topbar;

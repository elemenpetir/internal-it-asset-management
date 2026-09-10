import { Menu } from "lucide-react";
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

function Topbar({ onMenu }) {
  const name = localStorage.getItem("name") || "User";
  const role = getRoleFromToken();

  return (
    <header className="border-b border-sidebar-border bg-sidebar px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation menu"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[13px] font-semibold text-slate-100">{name}</p>
            <p className="text-xs text-slate-400">{roleLabels[role] || role}</p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {getInitials(name)}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;

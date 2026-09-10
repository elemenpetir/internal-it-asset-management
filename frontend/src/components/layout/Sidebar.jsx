import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Building2,
  History,
  LayoutDashboard,
  LogOut,
  Monitor,
  Users,
  Wrench,
} from "lucide-react";
import { getRoleFromToken } from "../../utils/auth";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";

function NavItem({ to, icon: Icon, children, end = false }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          cn(
            "relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] text-slate-400 hover:bg-white/5 hover:text-slate-100",
            isActive && "bg-accent font-medium text-accent-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
            )}
            <Icon className="h-4 w-4 shrink-0" />
            {children}
          </>
        )}
      </NavLink>
    </li>
  );
}

function NavLabel({ children }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
      {children}
    </p>
  );
}

function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const role = getRoleFromToken();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  }

  return (
    <>
      {/* backdrop, mobile only */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}
      <aside
        className={cn(
          "top-0 z-50 h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
          // drawer on mobile, static column on desktop
          "fixed md:sticky",
          open ? "flex" : "hidden md:flex",
        )}
      >
      <div className="px-5 pt-5 pb-4">
        <p className="text-[11px] font-semibold tracking-widest text-slate-500">
          INTERNAL IT ASSET
        </p>
        <p className="mt-0.5 text-base font-bold text-slate-100">AssetShield</p>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto px-3 py-2" onClick={onClose}>
        <ul className="space-y-0.5">
          <NavItem to="/" icon={LayoutDashboard} end>
            Overview
          </NavItem>
        </ul>

        <NavLabel>Assets</NavLabel>
        <ul className="space-y-0.5">
          <NavItem to="/assets" icon={Monitor}>
            Inventory
          </NavItem>
          <NavItem to="/assignments" icon={ArrowLeftRight}>
            Assignments
          </NavItem>
        </ul>

        <NavLabel>Operations</NavLabel>
        <ul className="space-y-0.5">
          {role === "asset_admin" && (
            <NavItem to="/employees" icon={Users}>
              Employees
            </NavItem>
          )}
          <NavItem to="/maintenance" icon={Wrench}>
            Maintenance
          </NavItem>
          {role !== "employee" && (
            <NavItem to="/audit-logs" icon={History}>
              Audit Log
            </NavItem>
          )}
        </ul>

        {role === "asset_admin" && (
          <>
            <NavLabel>Administration</NavLabel>
            <ul className="space-y-0.5">
              <NavItem to="/departments" icon={Building2}>
                Departments
              </NavItem>
            </ul>
          </>
        )}
      </nav>

      <Separator />

      <div className="p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] text-slate-400 hover:bg-white/5 hover:text-slate-100"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;

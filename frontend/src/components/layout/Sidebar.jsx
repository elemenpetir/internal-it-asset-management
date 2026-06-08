import { NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `block rounded-lg px-4 py-2 text-sm font-medium ${
    isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;

function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-slate-200 bg-slate-900 text-white">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-lg font-bold">AssetShield</h1>
        <p className="mt-1 text-sm text-slate-400">IT Ops Central</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className={navLinkClass}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/assets" className={navLinkClass}>
              Asset Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/assignments" className={navLinkClass}>
              Assignments
            </NavLink>
          </li>
          <li>
            <NavLink to="/maintenance" className={navLinkClass}>
              Maintenance
            </NavLink>
          </li>
          <li>
            <NavLink to="/audit-logs" className={navLinkClass}>
              Audit Logs
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

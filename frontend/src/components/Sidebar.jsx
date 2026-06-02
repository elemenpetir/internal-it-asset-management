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
            <a
              href="#"
              className="block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Asset Inventory
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Risk Assessment
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Maintenance
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Audit Logs
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar

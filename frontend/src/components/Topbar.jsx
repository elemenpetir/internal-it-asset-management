function Topbar() {
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search assets, users, or tickets..."
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
            🔔
          </button>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">IT Admin</p>
            <p className="text-xs text-slate-500">Asset Manager</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            RA
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;

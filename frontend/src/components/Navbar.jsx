function Navbar() {
  return (
    <nav className="mt-6 flex gap-6">
      <a href="#" className="font-medium text-slate-700 hover:text-slate-950">
        Dashboard
      </a>
      <a href="#" className="font-medium text-slate-700 hover:text-slate-950">
        Assets
      </a>
      <a href="#" className="font-medium text-slate-700 hover:text-slate-950">
        Assignments
      </a>
      <a href="#" className="font-medium text-slate-700 hover:text-slate-950">
        Audit Logs
      </a>
    </nav>
  );
}

export default Navbar;

import "./App.css";
import { Routes, Route } from "react-router-dom";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Assets from './pages/Assets'
import Assignments from './pages/Assignments'
import AuditLogs from './pages/AuditLogs'
import Maintenance from './pages/Maintenance'

function App() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <main className="p-8">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

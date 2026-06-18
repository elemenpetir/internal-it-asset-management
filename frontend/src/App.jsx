import "./App.css";
import { Routes, Route } from "react-router-dom";
import Topbar from "./components/layout/Topbar";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import Assets from "./pages/assets/Assets";
import CreateAsset from "./pages/assets/CreateAsset";
import AssetDetail from "./pages/assets/AssetDetail";
import EditAsset from "./pages/assets/EditAsset";
import Assignments from "./pages/assignments/Assignments";
import AssignmentDetail from "./pages/assignments/AssignmentDetail";
import Maintenance from "./pages/maintenance/Maintenance";
import CreateMaintenance from "./pages/maintenance/CreateMaintenance";
import MaintenanceDetail from "./pages/maintenance/MaintenanceDetail";
import AuditLogs from "./pages/audit-logs/AuditLogs";

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
              <Route path="/assets/new" element={<CreateAsset />} />
              <Route path="/assets/:id" element={<AssetDetail />} />
              <Route path="/assets/:id/edit" element={<EditAsset />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/assignments/:id" element={<AssignmentDetail />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/maintenance/new" element={<CreateMaintenance />} />
              <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

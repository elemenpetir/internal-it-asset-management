import "./App.css";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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
import Login from "./pages/auth/LoginPage";
import ActivateAccount from "./pages/auth/ActivatePage";
import Employees from "./pages/employees/Employees";
import Departments from "./pages/departments/Departments";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/activate-account" element={<ActivateAccount />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
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
        <Route path="/employees" element={<Employees />} />
        <Route path="/departments" element={<Departments />} />
      </Route>
    </Routes>
  );
}

export default App;

import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <Header />
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default App;

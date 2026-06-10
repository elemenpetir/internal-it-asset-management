import StatusBadge from "../../components/ui/StatusBadge";
import PageHeader from "../../components/ui/PageHeader";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");
  const location = useLocation();
  const navigate = useNavigate();
  const [flashMessage] = useState(location.state?.successMessage || "");

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/assets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "failed to fetch assets");
        }

        setAssets(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [token]);

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Asset Inventory"
          description="Monitor, update, and track all IT hardware assets."
        />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
          Loading assets...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Asset Inventory"
          description="Monitor, update, and track all IT hardware assets."
        />

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          title="Asset Inventory"
          description="Monitor, update, and track all IT hardware assets."
        />

        <Link
          to="/assets/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Asset
        </Link>
      </div>

      {flashMessage && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {flashMessage}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by asset code, name, or brand..."
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:max-w-md"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="under_maintenance">Under Maintenance</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Asset Code</th>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Brand</th>
              <th className="px-5 py-3 font-semibold">Serial Number</th>
              <th className="px-5 py-3 font-semibold">Location</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">
                    <Link
                      to={`/assets/${asset.id}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {asset.asset_code}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-800">{asset.name}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {asset.category_name}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-800">
                      {asset.brand}
                    </div>
                    <div className="text-xs text-slate-500">{asset.model}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {asset.serial_number}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{asset.location}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={asset.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-8 text-center text-slate-500"
                >
                  No assets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </div>
    </section>
  );
}

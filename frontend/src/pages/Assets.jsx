import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import { dummyAssets } from "../data/assets";
import { useState } from "react";

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAssets = dummyAssets.filter((asset) => {
    const matchesSearch =
      asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section>
      <PageHeader
        title="Asset Inventory"
        description="Monitor, update, and track all IT hardware assets."
      />
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
              <th className="px-5 py-3 font-semibold">Assigned To</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-indigo-600">
                    {asset.assetCode}
                  </td>
                  <td className="px-5 py-4 text-slate-900">{asset.name}</td>
                  <td className="px-5 py-4 text-slate-600">{asset.category}</td>
                  <td className="px-5 py-4 text-slate-600">{asset.brand}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {asset.serialNumber}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {asset.assignedTo}
                  </td>
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
          Showing {filteredAssets.length} of {dummyAssets.length} assets
        </div>
      </div>
    </section>
  );
}

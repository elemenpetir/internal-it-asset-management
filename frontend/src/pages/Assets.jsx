import StatusBadge from "../components/StatusBagde";

const dummyAssets = [
  {
    id: 1,
    assetCode: "AST-9921",
    name: "MacBook Pro M2 Max",
    category: "Laptop",
    brand: "Apple",
    serialNumber: "C02ZK39JLR",
    assignedTo: "Sarah Jenkins",
    status: "assigned",
  },
  {
    id: 2,
    assetCode: "AST-7629",
    name: "Dell XPS 15",
    category: "Laptop",
    brand: "Dell",
    serialNumber: "DXP-8820-LT",
    assignedTo: "-",
    status: "available",
  },
  {
    id: 3,
    assetCode: "AST-1829",
    name: "ThinkPad X1 Carbon",
    category: "Laptop",
    brand: "Lenovo",
    serialNumber: "LNV-5981-XP92",
    assignedTo: "Robert Chen",
    status: "under_maintenance",
  },
  {
    id: 4,
    assetCode: "AST-5510",
    name: "HP LaserJet Pro",
    category: "Printer",
    brand: "HP",
    serialNumber: "HP-LJ-7781",
    assignedTo: "-",
    status: "retired",
  },
];

export default function Assets() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">Asset Inventory</h2>
      <p className="mt-2 text-slate-600">
        Monitor, update, and track all IT hardware assets.
      </p>

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
            {dummyAssets.map((asset) => (
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
                <td className="px-5 py-4 text-slate-600">{asset.assignedTo}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={asset.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

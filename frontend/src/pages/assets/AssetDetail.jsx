import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";

export default function AssetDetail() {
  const { id } = useParams();
   return (
    <section>
      <PageHeader
        title="Asset Detail"
        description="View detailed information for a selected IT asset."
      />

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Selected asset ID: <span className="font-semibold text-slate-900">{id}</span>
        </p>

        <Link
          to="/assets"
          className="mt-4 inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Asset Inventory
        </Link>
      </div>
    </section>
  );
}

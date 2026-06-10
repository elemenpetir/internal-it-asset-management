import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import StatusBadge from "../../components/ui/StatusBadge";
import PageHeader from "../../components/ui/PageHeader";

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [flashMessage] = useState(location.state?.successMessage || "");

  useEffect(() => {
    async function fetchAssetDetail() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:3000/api/assets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch asset detail");
        }

        setAsset(result.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssetDetail();
  }, [id]);

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Asset Detail"
          description="View detailed information for a selected IT asset."
        />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading asset detail...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Asset Detail"
          description="View detailed information for a selected IT asset."
        />

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Asset Detail"
        description="View detailed information for a selected IT asset."
      />

      {flashMessage && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {flashMessage}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {asset.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{asset.asset_code}</p>
          </div>

          <StatusBadge status={asset.status} />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-500">Category</p>
            <p className="mt-1 text-sm text-slate-900">{asset.category_name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Brand</p>
            <p className="mt-1 text-sm text-slate-900">{asset.brand}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Model</p>
            <p className="mt-1 text-sm text-slate-900">{asset.model}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Serial Number</p>
            <p className="mt-1 text-sm text-slate-900">{asset.serial_number}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Purchase Date</p>
            <p className="mt-1 text-sm text-slate-900">
              {asset.purchase_date?.slice(0, 10)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Location</p>
            <p className="mt-1 text-sm text-slate-900">{asset.location}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-sm font-medium text-slate-500">Notes</p>
          <p className="mt-1 text-sm text-slate-900">
            {asset.notes || "No notes provided."}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            to="/assets"
            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Asset Inventory
          </Link>

          <Link
            to={`/assets/${asset.id}/edit`}
            className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Edit Asset
          </Link>
        </div>
      </div>
    </section>
  );
}

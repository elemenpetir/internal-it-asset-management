import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDateForInput } from "../../utils/date";
import { getRoleFromToken } from "../../utils/auth";
import { Skeleton } from "@/components/ui/skeleton";
import AssetForm from "./AssetForm";

const requiredFields = [
  "asset_code",
  "name",
  "category_id",
  "brand",
  "model",
  "serial_number",
  "purchase_date",
  "location",
];

export default function EditAsset() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const role = getRoleFromToken();

  useEffect(() => {
    if (role === "employee" || role === "manager") {
      navigate("/assets");
    }
  }, [role, navigate]);

  useEffect(() => {
    async function loadEditData() {
      try {
        const token = localStorage.getItem("token");
        const [assetResponse, categoriesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/assets/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/asset-categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const assetResult = await assetResponse.json();
        const categoriesResult = await categoriesResponse.json();
        if (!assetResponse.ok)
          throw new Error(
            assetResult.message || "Failed to fetch asset detail",
          );
        if (!categoriesResponse.ok)
          throw new Error(
            categoriesResult.message || "Failed to fetch asset categories",
          );
        setFormData({
          asset_code: assetResult.data.asset_code || "",
          name: assetResult.data.name || "",
          category_id: String(assetResult.data.category_id || ""),
          brand: assetResult.data.brand || "",
          model: assetResult.data.model || "",
          serial_number: assetResult.data.serial_number || "",
          purchase_date: formatDateForInput(assetResult.data.purchase_date),
          location: assetResult.data.location || "",
          notes: assetResult.data.notes || "",
        });
        setCategories(categoriesResult.data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadEditData();
  }, [id]);

  function handleFieldChange(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
    setValidationErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};
    for (const field of requiredFields) {
      if (!String(formData[field]).trim()) errors[field] = "Required.";
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/assets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            category_id: Number(formData.category_id),
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to update asset");
      toast.success("Asset updated successfully.");
      navigate(`/assets/${id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-100">Edit asset</h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-xl font-bold text-slate-100">Edit asset</h1>
      <p className="mt-0.5 text-[13px] text-slate-400">
        Update asset information.
      </p>
      <div className="mt-4">
        <AssetForm
          formData={formData}
          validationErrors={validationErrors}
          categories={categories}
          isSubmitting={isSubmitting}
          submitLabel="Save changes"
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/assets/${id}`)}
        />
      </div>
    </section>
  );
}

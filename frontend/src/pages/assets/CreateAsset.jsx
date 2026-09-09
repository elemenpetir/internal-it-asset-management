import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getRoleFromToken } from "../../utils/auth";
import AssetForm from "./AssetForm";

const emptyForm = {
  asset_code: "",
  name: "",
  category_id: "",
  brand: "",
  model: "",
  serial_number: "",
  purchase_date: "",
  location: "",
  notes: "",
};

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

export default function CreateAsset() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const role = getRoleFromToken();

  useEffect(() => {
    if (role === "employee" || role === "manager") {
      navigate("/assets");
    }
  }, [role, navigate]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/asset-categories`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Failed to fetch categories");
        setCategories(result.data);
      } catch (error) {
        setCategoryError(error.message);
      } finally {
        setIsCategoryLoading(false);
      }
    }
    fetchCategories();
  }, []);

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
        `${import.meta.env.VITE_API_URL}/api/assets`,
        {
          method: "POST",
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
        throw new Error(result.message || "Failed to create asset");
      toast.success("Asset created successfully.");
      navigate("/assets");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h1 className="text-xl font-bold text-slate-900">New asset</h1>
      <p className="mt-0.5 text-[13px] text-slate-500">
        Add an IT asset to the inventory.
      </p>
      <div className="mt-4">
        <AssetForm
          formData={formData}
          validationErrors={validationErrors}
          categories={categories}
          categoryLoading={isCategoryLoading}
          categoryError={categoryError}
          isSubmitting={isSubmitting}
          submitLabel="Create asset"
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/assets")}
        />
      </div>
    </section>
  );
}

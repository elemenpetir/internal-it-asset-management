import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";

export default function CreateAsset() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    asset_code: "",
    name: "",
    category_id: "",
    brand: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    location: "",
    notes: "",
  });
  const [categories, setCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    async function fetchCategories() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:3000/api/asset-categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "failed to fetch categories");
        }

        setCategories(result.data);
      } catch (error) {
        setCategoryError(error.message);
      } finally {
        setIsCategoryLoading(false);
      }
    }
    fetchCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    setValidationErrors({
    ...validationErrors,
    [name]: "",
  });
  }

  function validationForm() {
    const errors = {};

    if (!formData.asset_code.trim()) {
      errors.asset_code = "Asset code is required.";
    }

    if (!formData.name.trim()) {
      errors.name = "Asset name is required.";
    }

    if (!formData.category_id) {
      errors.category_id = "Category is required.";
    }

    if (!formData.brand.trim()) {
      errors.brand = "Brand is required.";
    }

    if (!formData.model.trim()) {
      errors.model = "Model is required.";
    }

    if (!formData.serial_number.trim()) {
      errors.serial_number = "Serial number is required.";
    }

    if (!formData.purchase_date) {
      errors.purchase_date = "Purchase date is required.";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validationForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          category_id: Number(formData.category_id),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "failed to create asset");
      }

      navigate("/assets", {
        state: {
          successMessage: "Asset created successfully",
        },
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Create Asset"
        description="Add a new IT asset to the inventory."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Asset Code
            </label>
            <input
              type="text"
              name="asset_code"
              value={formData.asset_code}
              onChange={handleChange}
              placeholder="AST-0001"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.asset_code && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.asset_code}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Laptop Lenovo ThinkPad"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.name && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">
                {isCategoryLoading
                  ? "loading categories..."
                  : "Select Category"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoryError && (
              <p className="mt-2 text-sm text-red-600">{categoryError}</p>
            )}
            {validationErrors.category_id && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.category_id}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Lenovo"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.brand && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.brand}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="ThinkPad T14"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.model && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.model}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Serial Number
            </label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="SN-LNV-001"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.serial_number && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.serial_number}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.purchase_date && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.purchase_date}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="IT Storage Room"
              className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.location && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.location}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium text-slate-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Optional asset notes..."
            className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {submitError && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/assets")}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? "Creating..." : "Create Asset"}
          </button>
        </div>
      </form>
    </section>
  );
}

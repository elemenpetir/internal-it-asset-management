import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDateForInput } from "../../utils/date";
import PageHeader from "../../components/ui/PageHeader";

export default function EditAsset() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    async function loadEditData() {
      try {
        const token = localStorage.getItem("token");

        const [assetResponse, categoriesResponse] = await Promise.all([
          fetch(`http://localhost:3000/api/assets/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:3000/api/asset-categories", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const assetResult = await assetResponse.json();
        const categoriesResult = await categoriesResponse.json();

        if (!assetResponse.ok) {
          throw new Error(
            assetResult.message || "Failed to fetch asset detail",
          );
        }
        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesResult.message || "Failed to fetch asset categories",
          );
        }

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

  function validateForm() {
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

  function handleChange() {
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

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitError("");
      return;
    }

    setValidationErrors({});

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/assets/${id}`, {
        method: "PUT",
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
        throw new Error(result.message || "Failed to update asset");
      }

      navigate(`/assets/${id}`, {
        state: {
          successMessage: "Asset updated successfully.",
        },
      });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader
          title="Edit Asset"
          description="Update existing IT asset information."
        />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading asset data...
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section>
        <PageHeader
          title="Edit Asset"
          description="Update existing IT asset information."
        />

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Edit Asset"
        description="Update existing IT asset information."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Asset Code
            </label>
            <input
              type="text"
              name="asset_code"
              value={formData.asset_code}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.asset_code && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.asset_code}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Asset Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.name && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              {validationErrors.category_id && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.category_id}
                </p>
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.brand && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.brand}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.model && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.model}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Serial Number
            </label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.serial_number && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.serial_number}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.purchase_date && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.purchase_date}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {validationErrors.location && (
              <p className="mt-2 text-sm text-red-600">
                {validationErrors.location}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {submitError && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            to={`/assets/${id}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

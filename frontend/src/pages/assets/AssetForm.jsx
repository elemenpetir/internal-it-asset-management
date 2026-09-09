import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function AssetForm({
  formData,
  validationErrors = {},
  categories = [],
  categoryLoading = false,
  categoryError = "",
  isSubmitting = false,
  submitLabel = "Save",
  onFieldChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Asset code" error={validationErrors.asset_code}>
          <Input
            name="asset_code"
            value={formData.asset_code}
            onChange={(e) => onFieldChange("asset_code", e.target.value)}
            placeholder="AST-0001"
            className="font-mono"
          />
        </Field>

        <Field label="Asset name" error={validationErrors.name}>
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="ThinkPad T14"
          />
        </Field>

        <Field label="Category" error={validationErrors.category_id}>
          <Select
            value={formData.category_id}
            onValueChange={(value) => onFieldChange("category_id", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  categoryLoading ? "Loading categories..." : "Select category"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryError && (
            <p className="text-xs text-red-600">{categoryError}</p>
          )}
        </Field>

        <Field label="Brand" error={validationErrors.brand}>
          <Input
            name="brand"
            value={formData.brand}
            onChange={(e) => onFieldChange("brand", e.target.value)}
            placeholder="Lenovo"
          />
        </Field>

        <Field label="Model" error={validationErrors.model}>
          <Input
            name="model"
            value={formData.model}
            onChange={(e) => onFieldChange("model", e.target.value)}
            placeholder="ThinkPad T14 Gen 3"
          />
        </Field>

        <Field label="Serial number" error={validationErrors.serial_number}>
          <Input
            name="serial_number"
            value={formData.serial_number}
            onChange={(e) => onFieldChange("serial_number", e.target.value)}
            placeholder="SN-LNV-001"
            className="font-mono"
          />
        </Field>

        <Field label="Purchase date" error={validationErrors.purchase_date}>
          <Input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={(e) => onFieldChange("purchase_date", e.target.value)}
          />
        </Field>

        <Field label="Location" error={validationErrors.location}>
          <Input
            name="location"
            value={formData.location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder="IT Storage Room"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Notes">
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={(e) => onFieldChange("notes", e.target.value)}
            rows={3}
            placeholder="Optional asset notes..."
          />
        </Field>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

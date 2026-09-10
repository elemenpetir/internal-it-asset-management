import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getRoleFromToken } from "../../utils/auth";
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

export default function CreateMaintenance() {
  const navigate = useNavigate();
  const role = getRoleFromToken();

  const [employeeNumber, setEmployeeNumber] = useState("");
  const [assets, setAssets] = useState([]);
  const [assetId, setAssetId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetError, setAssetError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // B21: latest search wins — a new Search aborts the previous request
  const searchController = useRef(null);

  useEffect(() => {
    if (role === "manager") {
      navigate("/maintenance");
    }
  }, [role, navigate]);

  useEffect(() => {
    if (role !== "employee") return;
    fetchAssets();
  }, [role]);

  async function fetchAssets(empNumber = null) {
    // cancel any in-flight search before starting a new one
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    try {
      setIsLoadingAssets(true);
      setAssetError("");
      setAssets([]);
      setAssetId("");

      const token = localStorage.getItem("token");
      const body = empNumber ? { employee_number: empNumber } : undefined;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/maintenance-requests/my-assets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          ...(body && { body: JSON.stringify(body) }),
          signal: controller.signal,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch assets");
      }

      setAssets(result.data);
    } catch (error) {
      if (error.name !== "AbortError") setAssetError(error.message);
    } finally {
      if (!controller.signal.aborted) setIsLoadingAssets(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!assetId || !issueDescription.trim()) {
      toast.error("Asset and issue description are required.");
      return;
    }

    // B10: admin must supply employee_number before the search can happen
    if (role === "asset_admin" && !employeeNumber.trim()) {
      toast.error("Employee number is required to search their assets.");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const body = {
        asset_id: Number(assetId),
        issue_description: issueDescription,
      };
      if (role === "asset_admin") {
        body.employee_number = employeeNumber;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/maintenance-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create maintenance request",
        );
      }

      toast.success("Maintenance request created successfully.");
      navigate("/maintenance");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h1 className="text-xl font-bold text-slate-100">New request</h1>
      <p className="mt-0.5 text-[13px] text-slate-400">
        Report a technical issue with assigned equipment.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "asset_admin" && (
              <div className="space-y-1.5">
                <Label>Employee number</Label>
                <div className="flex gap-2">
                  <Input
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    placeholder="EMP-0001"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    onClick={() => fetchAssets(employeeNumber)}
                    disabled={!employeeNumber || isLoadingAssets}
                  >
                    {isLoadingAssets ? "Loading..." : "Search"}
                  </Button>
                </div>
                {assetError && (
                  <p className="text-xs text-red-400">{assetError}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Asset</Label>
              <Select
                value={assetId}
                onValueChange={setAssetId}
                disabled={assets.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingAssets
                        ? "Loading assets..."
                        : assets.length === 0
                          ? "No assets available"
                          : "Select asset"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem
                      key={asset.asset_id}
                      value={String(asset.asset_id)}
                    >
                      {asset.asset_code} ({asset.asset_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role === "employee" && assetError && (
                <p className="text-xs text-red-400">{assetError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Issue description</Label>
              <Textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                placeholder="Symptoms, when it started, steps already taken..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/maintenance")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-slate-100">How it works</h2>
          <ol className="mt-3 space-y-3">
            {[
              ["Triage", "The team reviews your request."],
              ["Assessment", "A technician diagnoses the issue."],
              ["Resolution", "Repaired or replaced, then returned."],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-slate-200">
                    {title}
                  </p>
                  <p className="text-xs text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

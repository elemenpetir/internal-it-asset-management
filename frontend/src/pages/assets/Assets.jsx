import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { getRoleFromToken } from "../../utils/auth";
import StatusBadge from "../../components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const role = getRoleFromToken();
  const limit = 10;
  // ponytail: 400ms debounce, typing "mouse" fires 1 request instead of 5
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (statusFilter !== "all") params.append("status", statusFilter);
        params.append("page", page);
        params.append("limit", limit);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/assets?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Failed to fetch assets");
        setAssets(result.data);
        setPagination(result.pagination);
      } catch (error) {
        if (error.name !== "AbortError") setErrorMessage(error.message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchAssets();
    return () => controller.abort();
  }, [token, debouncedSearch, statusFilter, page]);

  if (errorMessage) {
    return (
      <section>
        <h1 className="text-xl font-bold text-slate-100">Asset inventory</h1>
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMessage}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Asset inventory</h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Monitor and track company IT assets.
          </p>
        </div>
        {role === "asset_admin" && (
          <Button onClick={() => navigate("/assets/new")}>
            <Plus className="h-4 w-4" />
            New asset
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 md:flex-row">
        <div className="relative md:max-w-sm md:flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search code, name, brand, serial..."
            className="bg-card pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="bg-card md:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="under_maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : assets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/assets/${asset.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/assets/${asset.id}`);
                  }}
                >
                  <TableCell>
                    <Link
                      to={`/assets/${asset.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono font-medium text-link hover:underline"
                    >
                      {asset.asset_code}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-200">
                      {asset.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {asset.brand} {asset.model}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {asset.category_name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">
                    {asset.serial_number}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {asset.location}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="p-8 text-center text-[13px] text-slate-400">
            No assets found.
          </p>
        )}

        {pagination && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[13px] text-slate-400">
            <span className="tabular-nums">
              {assets.length} of {pagination.total}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <span className="px-1 tabular-nums">
                {pagination.total === 0
                  ? "0 / 0"
                  : `${pagination.page} / ${pagination.total_pages}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.total_pages))
                }
                // B20: no next page when there are zero pages
                disabled={
                  page >= pagination.total_pages ||
                  pagination.total_pages === 0
                }
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

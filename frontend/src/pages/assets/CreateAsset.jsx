import PageHeader from "../../components/ui/PageHeader";

export default function CreateAsset() {
  return (
    <section>
      <PageHeader
        title="Create Asset"
        description="Add a new IT asset to the inventory."
      />

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Asset form will be built here.</p>
      </div>
    </section>
  );
}

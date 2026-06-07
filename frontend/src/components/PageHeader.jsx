export default function PageHeader({ title, description }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  );
}

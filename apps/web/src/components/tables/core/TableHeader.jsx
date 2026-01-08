import SearchField from "@/components/ui/Search";

export default function TableHeader({
  title,
  subtitle,
  search,
  setSearch,
  actions,
}) {
  return (
    <div className="p-6 border-b border-border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* LEFT */}
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search users..."
          />

          {actions}
        </div>
      </div>
    </div>
  );
}

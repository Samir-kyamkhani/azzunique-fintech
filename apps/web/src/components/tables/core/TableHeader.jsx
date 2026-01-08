import SearchField from "@/components/ui/Search";
import FilterDropdown from "@/components/ui/Filter";
import Button from "@/components/ui/Button";

export default function TableHeader({
  title,
  subtitle,

  // SEARCH
  search,
  setSearch,
  searchPlaceholder = "Search...",

  // FILTER
  filterValue,
  onFilterChange,
  filterPlaceholder = "Filter",
  filterOptions = [],

  // ACTIONS
  onAdd,
  onExport,
  addLabel = "Add",
  exportLabel = "Export",
  addIcon,
  exportIcon,
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
          {/* SEARCH */}
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={searchPlaceholder}
          />

          {/* FILTER */}
          <FilterDropdown
            value={filterValue}
            onChange={onFilterChange}
            placeholder={filterPlaceholder}
            options={filterOptions}
          />

          {/* ADD BUTTON */}
          <Button variant="default" icon={addIcon} onClick={onAdd}>
            {addLabel}
          </Button>

          {/* EXPORT BUTTON */}
          {onExport && (
            <Button variant="outline" icon={exportIcon} onClick={onExport}>
              {exportLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

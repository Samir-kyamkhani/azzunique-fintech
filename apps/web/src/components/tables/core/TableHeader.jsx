import SearchField from "@/components/ui/SearchField";
import FilterDropdown from "@/components/ui/Filter";
import Button from "@/components/ui/Button";

export default function TableHeader({
  title,
  subtitle,
  search,
  setSearch,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterPlaceholder = "Filter",
  filterOptions = [],
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
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={searchPlaceholder}
          />

          <FilterDropdown
            value={filterValue}
            onChange={onFilterChange}
            placeholder={filterPlaceholder}
            options={filterOptions}
          />

          {onAdd && (
            <Button variant="default" icon={addIcon} onClick={onAdd}>
              {addLabel}
            </Button>
          )}

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

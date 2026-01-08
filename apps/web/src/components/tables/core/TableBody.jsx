import DataTableSearchEmpty from "./DataTableSearchEmpty";
import TableRow from "./TableRow";

export default function TableBody({ columns, data }) {
  return (
    <div className="relative overflow-x-auto overflow-y-visible">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-sm text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <DataTableSearchEmpty
                  isEmpty
                  emptyTitle="No results found"
                  emptyDescription="Try changing search or filters."
                />
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <TableRow key={i} row={row} columns={columns} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

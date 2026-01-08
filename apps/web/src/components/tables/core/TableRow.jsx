import RowActions from "./RowActions";

export default function TableRow({ columns, row }) {
  return (
    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
      {columns?.map((col) => (
        <td key={col.key} className="px-6 py-4 text-sm">
          {col.key === "actions" ? (
            <RowActions
              onView={() => console.log("View", row)}
              onEdit={() => console.log("Edit", row)}
              onDelete={() => console.log("Delete", row)}
            />
          ) : col.render ? (
            col.render(row)
          ) : (
            row[col.key]
          )}
        </td>
      ))}
    </tr>
  );
}

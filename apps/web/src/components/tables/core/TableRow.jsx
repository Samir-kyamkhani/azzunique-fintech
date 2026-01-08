export default function TableRow({ row, columns }) {
  return (
    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
      {columns.map((col) => (
        <td key={col.key} className="px-6 py-4 text-sm">
          {col.render ? col.render(row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
}

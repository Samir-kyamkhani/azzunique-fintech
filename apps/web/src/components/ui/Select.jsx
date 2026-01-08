export default function SelectField({ label, error, children, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      <select {...props} className="input h-10 bg-background text-foreground">
        {children}
      </select>

      {error && (
        <p className="text-xs text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}

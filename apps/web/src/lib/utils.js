export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export const statusColor = {
  ACTIVE: {
    label: "Active",
    className: "bg-success/10 text-success border border-success/20",
  },
  INACTIVE: {
    label: "Inactive",
    className: "bg-warning/10 text-warning border border-warning/20",
  },
  SUSPENDED: {
    label: "Suspended",
    className:
      "bg-destructive/10 text-destructive border border-destructive/20",
  },
};

export const formatDateTime = (isoString) => {
  if (!isoString) return "-";

  return new Date(isoString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const onlyDigits = (maxLength) => (e) => {
  let value = e.target.value.replace(/\D/g, "");

  if (maxLength) {
    value = value.slice(0, maxLength);
  }

  e.target.value = value;
};

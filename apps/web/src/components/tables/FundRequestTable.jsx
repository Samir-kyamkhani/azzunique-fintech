"use client";

import { Download } from "lucide-react";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";

/* ---------------- FILTER OPTIONS ---------------- */
const options = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
  { label: "Rejected", value: "REJECTED" },
];

/* ===================== COLUMNS ===================== */
const getColumns = () => [
  { key: "referenceId", label: "Reference No" },
  { key: "tenantNumber", label: "Tenant No" },
  { key: "tenantName", label: "Tenant Name" },
  { key: "providerTxnId", label: "Txn ID" },
  { key: "providerCode", label: "Provider" },
  { key: "paymentMode", label: "Payment Mode" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

/* ===================== COMPONENT ===================== */
export default function FundRequestTable({
  requestFundData,
  total,
  page,
  perPage,
  onPageChange,
  search,
  onSearch,
  onEdit,
  statusFilter,
  onStatusFilterChange,
  loading,
}) {
  const columns = getColumns();

  return (
    <TableShell>
      <TableHeader
        title="Fund Requests"
        subtitle={`${total} fund request(s) found`}
        search={search}
        setSearch={onSearch}
        searchPlaceholder="Search by txn id, tenant name, provider…"
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterPlaceholder="Status"
        filterOptions={options}
        onExport={() => console.log("Export fund requests")}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={requestFundData}
        loading={loading}
        onEdit={onEdit}
      />

      <TablePagination
        page={page}
        setPage={onPageChange}
        total={total}
        perPage={perPage}
      />
    </TableShell>
  );
}

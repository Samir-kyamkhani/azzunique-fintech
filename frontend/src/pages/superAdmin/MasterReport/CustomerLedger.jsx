import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CustomerLedger = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  const ledgerData = [
    {
      id: 1,
      date: "07 Jul 2025",
      time: "16:32:53",
      txnId: "2477183233568FFBD",
      customerName: "MONEYMATRIX | EPVX66661",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "",
      credit: "₹94,599.12",
      balance: "₹94,599.12",
    },
    {
      id: 2,
      date: "07 Jul 2025",
      time: "16:31:20",
      txnId: "2477183236285FFBD",
      customerName: "MONEYMATRIX | EPVX66661",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "",
      credit: "₹94,599.12",
      balance: "₹94,599.12",
    },
    {
      id: 3,
      date: "07 Jul 2025",
      time: "16:30:47",
      txnId: "2477183247768FFBD",
      customerName: "MONEYMATRIX | EPVX66661",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "₹9.83",
      credit: "",
      balance: "₹94,480.81",
    },
    {
      id: 4,
      date: "07 Jul 2025",
      time: "16:28:41",
      txnId: "2477183441748FFBD",
      customerName: "CASHINPAY | 9078262B13",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "₹5.83",
      credit: "",
      balance: "₹94,471.84",
    },
    {
      id: 5,
      date: "07 Jul 2025",
      time: "16:23:29",
      txnId: "2477183291BF8510",
      customerName: "THE AERO CASH | 9829750440",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "₹9.80",
      credit: "",
      balance: "₹94,562.27",
    },
    {
      id: 6,
      date: "07 Jul 2025",
      time: "16:21:23",
      txnId: "2477183748B68B16",
      customerName: "MONEYMATRIX | EPVX66661",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "₹5.83",
      credit: "",
      balance: "₹94,512.27",
    },
    {
      id: 7,
      date: "07 Jul 2025",
      time: "16:16:35",
      txnId: "2477183669743A4D",
      customerName: "AADHCAY | 782859D071",
      customerType: "API HOLDER",
      narration:
        "COMMISSION Commission sum by TxnId 230777118235768BE of MNI Statement of service REMITTANCE",
      debit: "₹12.89",
      credit: "",
      balance: "₹94,512.27",
    },
    {
      id: 8,
      date: "07 Jul 2025",
      time: "16:16:35",
      txnId: "2477183669430B5CC",
      customerName: "AADHCAY | 782859D071",
      customerType: "ADMIN",
      narration:
        "COMMISSION Commission sum by TxnId 230777118235768BE of MNI Statement of service REMITTANCE",
      debit: "₹49.72",
      credit: "",
      balance: "₹94,532.09",
    },
    {
      id: 9,
      date: "07 Jul 2025",
      time: "15:27:49",
      txnId: "2477183274938B0AD",
      customerName: "CASHINPAY | 9078262B13",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "₹5.83",
      credit: "",
      balance: "₹94,563.27",
    },
    {
      id: 10,
      date: "07 Jul 2025",
      time: "15:27:24",
      txnId: "2477183475648B0HC",
      customerName: "THE AERO CASH | 9829750440",
      customerType: "API HOLDER",
      narration:
        "AEPS Commission sum by TxnId 230777118235768BE of MNI Statement of service AEPS",
      debit: "₹9.80",
      credit: "",
      balance: "₹94,569.10",
    },
  ];

  const filteredData = ledgerData.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.txnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === currentData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentData.map((item) => item.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Customer Ledger
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor all your financial transactions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">07/07/2025</span>
              <span className="text-sm text-gray-500">to</span>
              <span className="text-sm font-medium">07/07/2025</span>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white  mt-6 rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} entries
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={
                      selectedRows.length === currentData.length &&
                      currentData.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Narration
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${
                    selectedRows.includes(item.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedRows.includes(item.id)}
                      onChange={() => handleRowSelect(item.id)}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.date}</div>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {item.txnId}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.customerType === "API HOLDER"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.customerType}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="text-sm text-gray-900 max-w-xs truncate"
                      title={item.narration}
                    >
                      {item.narration}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div
                      className={`text-sm font-medium ${
                        item.debit ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      {item.debit || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div
                      className={`text-sm font-medium ${
                        item.credit ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {item.credit || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {item.balance}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg ${
                      currentPage === pageNum
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLedger;

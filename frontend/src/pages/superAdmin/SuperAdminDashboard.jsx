import {
  Users,
  DollarSign,
  Wallet,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import StatsCard from "../../components/Ui/StatsCard";
import { gradientColors } from "../../index.js";
import DailySales from "../../components/Ui/DailySales.jsx";
import MiniCard from "../../components/Ui/MiniCard.jsx";

// Sample data for charts
const dailySalesData = [
  { name: "REMITTANCE", value: 4026.05 },
  { name: "SETTLEMENT", value: 25000 },
  { name: "AEPS", value: 0 },
];

const walletCustomerData = [
  {
    role: "RETAILER",
    wallet: 2100.0,
    aeps: 100.0,
    pgWallet: 0.0,
    customers: 6,
  },
  {
    role: "API HOLDER",
    wallet: 269592.19,
    aeps: 389081.39,
    pgWallet: 0.0,
    customers: 12,
  },
];

const topSellingServices = [
  { service: "REMITTANCE", success: 9426.05, failed: 0, pending: 0, refund: 0 },
  {
    service: "SETTLEMENT",
    success: 25000,
    failed: 24528,
    pending: 0,
    refund: 0,
  },
  { service: "AEPS", success: 0, failed: 0, pending: 0, refund: 0 },
];

const productSaleByAPI = [
  {
    apiName: "FINOPAY",
    success: 24638.84,
    failed: 24528,
    pending: 0,
    refund: 0,
  },
  { apiName: "SG-2 Min", success: 2, failed: 2, pending: 0, refund: 0 },
  { apiName: "ICICI", success: 2, failed: 2, pending: 0, refund: 0 },
];

const productSaleByService = [
  { product: "DMT [1-1000]", status: "SUCCESS", amount: 1012, hits: 1 },
  { product: "DMT [1001-2000]", status: "SUCCESS", amount: 1466.84, hits: 1 },
  {
    product: "Move To Bank via IMPS [1-10000]",
    status: "FAILED",
    amount: 24528,
    hits: 2,
  },
  {
    product: "Move To Bank via IMPS [1-10000]",
    status: "SUCCESS",
    amount: 25000,
    hits: 2,
  },
];

const walletRequests = [
  {
    customerName: "TEJPAL (+916742100871)",
    bankName: "ICICI BANK (672550500131)",
    transactionId: "33134590",
    amount: 1000,
  },
];

// Modern Mini Card Component

// Modern Table Component
const ModernTable = ({ title, headers, data, renderRow }) => (
  <div className="bg-white rounded-2xl shadow-lg border  border-gray-100  overflow-x-auto custom-scrollbar">
    <div className="p-6 border-b border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <table className="w-full ">
      <thead className="bg-gray-50  ">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, index) => (
          <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
            {renderRow(row, index)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Main Dashboard Component
const SuperAdminDashboard = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">


      <div className=" space-y-8">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Company Wallet"
            value="₹164,258.62"
            icon={Wallet}
            gradient={gradientColors[0]}
            trend="+12.5%"
          />
          <StatsCard
            title="Purchase"
            value="₹0.00"
            icon={DollarSign}
            gradient={gradientColors[1]}
          />
          <StatsCard
            title="Wallet Transfer"
            value="₹0.00"
            icon={RefreshCw}
            gradient={gradientColors[2]}
          />
          <StatsCard
            title="Wallet Revert"
            value="₹0.00"
            icon={ArrowDownRight}
            gradient={gradientColors[3]}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsCard
            title="Total Customers"
            value="18"
            icon={Users}
            gradient={gradientColors[4]}
            trend="+2 this week"
          />
          <StatsCard
            title="Customer Wallet"
            value="₹572,242.38"
            icon={Wallet}
            gradient={gradientColors[5]}
            trend="+8.2%"
          />
        </div>

        {/* Transaction Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            <MiniCard title="Commission IN" value="₹24.02" />
            <MiniCard title="Commission OUT" value="₹-0.38" isNegative />
            <MiniCard title="TDS" value="₹24.40" />
            <MiniCard title="Pay In" value="₹0.00" />
            <MiniCard title="Pay Out" value="₹65,066.68" />
            <MiniCard title="Pending Amount" value="₹0.00" />
            <MiniCard title="Failed Amount" value="₹29,420.00" isNegative />
            <MiniCard title="Refund Amount" value="₹0.00" />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Daily Sales Chart */}
          <DailySales />

          {/* Wallet Customer Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Wallet Customer Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 rounded-lg">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AEPS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PG Wallet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Customers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {walletCustomerData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.role}</td>
                      <td className="px-4 py-3 text-gray-700">₹{row.wallet.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700">₹{row.aeps.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700">₹{row.pgWallet.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-700">{row.customers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Services and API Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top Selling Services */}
          <ModernTable
            title="Top Selling Services"
            headers={["Services", "Success", "Failed", "Pending", "Refund"]}
            data={topSellingServices}
            renderRow={(row, index) => (
              <>
                <td className="px-6 py-4 font-medium text-gray-900">{row.service}</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">₹{row.success.toLocaleString()}</td>
                <td className="px-6 py-4 text-red-600 font-medium">₹{row.failed.toLocaleString()}</td>
                <td className="px-6 py-4 text-yellow-600 font-medium">₹{row.pending.toLocaleString()}</td>
                <td className="px-6 py-4 text-blue-600 font-medium">₹{row.refund.toLocaleString()}</td>
              </>
            )}
          />

          {/* Product Sale By API */}
          <ModernTable
            title="Product Sale By API's"
            headers={["API Name", "Success", "Failed", "Pending", "Refund"]}
            data={productSaleByAPI}
            renderRow={(row, index) => (
              <>
                <td className="px-6 py-4 font-medium text-gray-900">{row.apiName}</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">₹{row.success.toLocaleString()}</td>
                <td className="px-6 py-4 text-red-600 font-medium">₹{row.failed.toLocaleString()}</td>
                <td className="px-6 py-4 text-yellow-600 font-medium">₹{row.pending.toLocaleString()}</td>
                <td className="px-6 py-4 text-blue-600 font-medium">₹{row.refund.toLocaleString()}</td>
              </>
            )}
          />
        </div>

        {/* Product Sale By Service and Wallet Request */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Product Sale By Service */}
          <ModernTable
            title="Product Sale By Service"
            headers={["Product", "Status", "Amount", "No Of Hits"]}
            data={productSaleByService}
            renderRow={(row, index) => (
              <>
                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{row.product}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${row.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">₹{row.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-700">{row.hits}</td>
              </>
            )}
          />

          {/* Wallet Request */}
          <ModernTable
            title="Wallet Requests"
            headers={["Customer", "Bank", "Transaction ID", "Amount"]}
            data={walletRequests}
            renderRow={(row, index) => (
              <>
                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{row.customerName}</td>
                <td className="px-6 py-4 text-gray-700 max-w-xs truncate">{row.bankName}</td>
                <td className="px-6 py-4 text-gray-700">{row.transactionId}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">₹{row.amount.toLocaleString()}</td>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
"use client";

import { ArrowDownRight } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Search } from "lucide-react";
import { Filter } from "lucide-react";
import { Eye, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const transactions = [
  {
    id: "TXN001",
    description: "Salary Deposit",
    amount: 50000,
    type: "credit",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "TXN002",
    description: "Amazon Purchase",
    amount: 2500,
    type: "debit",
    status: "completed",
    date: "2024-01-14",
  },
  {
    id: "TXN003",
    description: "Electricity Bill",
    amount: 1800,
    type: "debit",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "TXN004",
    description: "Freelance Payment",
    amount: 15000,
    type: "credit",
    status: "completed",
    date: "2024-01-13",
  },
  {
    id: "TXN005",
    description: "Netflix Subscription",
    amount: 649,
    type: "debit",
    status: "failed",
    date: "2024-01-12",
  },
];

// Mock data for the dashboard
const dashboardStats = {
  totalBalance: 125845.67,
  totalRevenue: 85420.5,
  totalExpenses: 42310.25,
  netProfit: 43110.25,
  activeUsers: 2548,
  transactions: 18456,
  pendingTransfers: 12,
  failedTransactions: 5,
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export function TransactionTable() {
  const [search, setSearch] = useState("");

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-lg-border">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent Transactions
            </h2>
            <p className="text-sm text-muted-foreground">
              {dashboardStats.transactions} transactions this month
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-input hover:bg-accent rounded-border transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Description
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Category
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Date & Time
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Amount
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-border hover:bg-accent/50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        transaction.type === "credit"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {transaction.type === "credit" ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: TXN{transaction.id.toString().padStart(6, "0")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                    {transaction.category}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <p className="text-sm text-foreground">
                      {transaction.date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.time}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p
                    className={`text-sm font-semibold ${
                      transaction.type === "credit"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    {getStatusIcon(transaction.status)}
                    <span className="ml-2 text-sm capitalize">
                      {transaction.status}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-accent rounded-border transition-colors">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-accent rounded-border transition-colors">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing 5 of {dashboardStats.transactions} transactions
          </div>
          <Link
            href="/dashboard/transactions"
            className="px-4 py-2 bg-gradient-theme text-primary-foreground rounded-border hover:opacity-90 transition-colors"
          >
            View All Transactions
          </Link>
        </div>
      </div>
    </div>
  );
}

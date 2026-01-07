"use client";

import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

const stats = [
  {
    title: "Total Balance",
    value: "₹125,845.67",
    change: "+12.5%",
    isPositive: true,
    icon: Wallet,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Monthly Revenue",
    value: "₹85,420.50",
    change: "+8.2%",
    isPositive: true,
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Total Expenses",
    value: "₹42,310.25",
    change: "-3.5%",
    isPositive: false,
    icon: TrendingDown,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Active Cards",
    value: "4",
    change: "+1 this month",
    isPositive: true,
    icon: CreditCard,
    color: "text-info",
    bgColor: "bg-info/10",
  },
];

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg-border p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.isPositive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {stat.change}
            </div>
          </div>
          <h3 className="text-sm text-muted-foreground mb-1">{stat.title}</h3>
          <p className="text-2xl font-bold text-foreground mb-2">
            {stat.value}
          </p>
          <div
            className={`flex items-center text-sm ${stat.isPositive ? "text-success" : "text-destructive"}`}
          >
            {stat.isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span>From last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}

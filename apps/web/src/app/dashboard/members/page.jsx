"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample user data
  const users = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
    status: i % 4 === 0 ? "Active" : "Inactive",
    joinDate: `2024-01-${String(i + 1).padStart(2, "0")}`,
  }));

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all users in your organization
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Total Users",
            value: "1,234",
            change: "+12%",
            color: "bg-primary/10 text-primary",
          },
          {
            title: "Active Users",
            value: "987",
            change: "+8%",
            color: "bg-success/10 text-success",
          },
          {
            title: "New Users",
            value: "156",
            change: "+23%",
            color: "bg-info/10 text-info",
          },
          {
            title: "Inactive Users",
            value: "91",
            change: "-4%",
            color: "bg-warning/10 text-warning",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-lg-border border border-border p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${stat.color}`}
              >
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-card rounded-lg-border border border-border shadow-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                All Users
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredUsers.length} users found
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-input hover:bg-accent rounded-border transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-theme text-primary-foreground rounded-border hover:opacity-90 transition-colors">
                <Users className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                  ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                  Join Date
                </th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4 px-6 text-sm text-foreground">
                    {user.id}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-theme rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-3">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "Admin"
                          ? "bg-primary/10 text-primary"
                          : user.role === "Editor"
                            ? "bg-info/10 text-info"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {user.joinDate}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-accent rounded-border transition-colors">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-accent rounded-border transition-colors">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-accent rounded-border transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-input rounded-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-border transition-colors ${
                    currentPage === i + 1
                      ? "bg-primary text-primary-foreground"
                      : "border border-input hover:bg-accent"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-input rounded-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-input hover:bg-accent rounded-border transition-colors">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

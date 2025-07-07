import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
  UserCircle,
  X,
} from "lucide-react";
import React from "react";

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <header className="fixed top-0 right-0 z-40 bg-white border-b border-gray-200   w-full  lg:w-[calc(100%-17.5rem)] ">
      <div className="px-6 py-4 md:py-[0.57rem]">
        <div className="flex items-center justify-between">
          {/* Left: Sidebar toggle and title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>

          {/* Right: Search, Notification, and User */}
          <div className="flex items-center space-x-4">
            {/* Search (hidden on small screens) */}
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notification Bell */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none">
                <User className="w-5 h-5" />
                <span className="ml-2">Admin</span>
                <ChevronDown className="ml-1" size={16} />
              </button>
              {/* You can add a dropdown here if needed */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

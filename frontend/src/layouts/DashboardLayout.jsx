import { Outlet } from "react-router-dom";
import Navbar from "../components/HeaderFooter/Navbar";
import { useState } from "react";
import MasterSidebar from "../components/HeaderFooter/MasterSidebar";
import { getUserRole } from "../setting";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const user = getUserRole();

  const renderSidebar = () => {
    switch (user) {
      case "Super_Admin":
        return (
          <MasterSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        );
      default:
        return null;
    }
  };

  const renderNavbar = () => {
    switch (user) {
      case "Super_Admin":
        return (
          <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        );
      default:
        return null;
    }
  };

  if (user !== "Super_Admin") {
    return <div>Unauthorized or unknown role</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="lg:fixed lg:h-full lg:w-64">{renderSidebar()}</div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full">
        {renderNavbar()}

        <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-10 overflow-y-auto pt-16 lg:ml-[260px] mt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

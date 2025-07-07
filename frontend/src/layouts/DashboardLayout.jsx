import { Outlet } from "react-router-dom";
import Navbar from "../components/HeaderFooter/Navbar";
import { useState } from "react";
import Sidebar from "../components/HeaderFooter/Sidebar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="lg:fixed lg:h-full lg:w-64">{<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}</div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full">
        {<Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}

        <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-10 overflow-y-auto pt-16 lg:ml-[260px] mt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

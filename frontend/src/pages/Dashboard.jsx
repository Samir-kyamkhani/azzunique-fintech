import { getUserRole } from "../setting";
import AdminDashboard from "./admin/AdminDashboard";
import SuperAdminDashboard from "./superAdmin/SuperAdminDashboard";
// import other dashboards if needed

export default function Dashboard() {
  const user = getUserRole();

  const renderDashboard = () => {
    switch (user) {
      case "Super_Admin":
        return <SuperAdminDashboard />;
      case "Admin":
        return <AdminDashboard />;

      default:
        return <div>Unauthorized or unknown role</div>;
    }
  };

  return <>{renderDashboard()}</>;
}

import { getUserRole } from "../setting";
import SuperAdminDashboard from "./superAdmin/SuperAdminDashboard";
// import other dashboards if needed

export default function Dashboard() {
  const user = getUserRole();

  const renderDashboard = () => {
    switch (user) {
      case "Super_Admin":
        return <SuperAdminDashboard />;

      default:
        return <div>Unauthorized or unknown role</div>;
    }
  };

  return <>{renderDashboard()}</>;
}

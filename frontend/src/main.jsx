import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LedgerReport from "./pages/superAdmin/MasterReport/LedgerReport.jsx";
import CustomerLedger from "./pages/superAdmin/MasterReport/CustomerLedger.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      {/* <Route path="/" element={<LandingPageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route> */}

      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="ledger-report" element={<LedgerReport />} />
        <Route path="customer-ledger" element={<CustomerLedger />} />
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

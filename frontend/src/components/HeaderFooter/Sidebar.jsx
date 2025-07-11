import React, { useState } from "react";
import {
  Home,
  FileText,
  Settings,
  BarChart3,
  UserPlus,
  RefreshCw,
  HelpCircle,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { getUserRole } from "../../setting";
import { useNavigate } from "react-router-dom";

// Menu data structure
const menuItems = [
  {
    role: "Super_Admin",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: Home,
        path: "/dashboard",
      },
      {
        id: "master-report",
        label: "Master Report",
        icon: FileText,
        children: [
          {
            id: "ledger-report",
            label: "Ledger Report",
            path: "/dashboard/ledger-report",
          },
          {
            id: "customer-ledger",
            label: "Customer Ledger",
            path: "/dashboard/customer-ledger",
          },
          { id: "tds-gst", label: "TDS & GST", path: "/dashboard/tds-gst" },
          {
            id: "sales-products",
            label: "Sales By Products",
            path: "/dashboard/sales-products",
          },
          {
            id: "sales-service",
            label: "Sales By Service",
            path: "/dashboard/sales-service",
          },
          {
            id: "sales-purchase",
            label: "Sales Purchase",
            path: "/dashboard/sales-purchase",
          },
          {
            id: "customer-sales-purchase",
            label: "Customer Sales Purchase",
            path: "/dashboard/customer-sales-purchase",
          },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        children: [
          {
            id: "admin-setting",
            label: "Admin Setting",
            children: [
              {
                id: "commission-setting",
                label: "Commission Setting",
                path: "/settings/admin/commission",
              },
              {
                id: "user-commission",
                label: "User Commission",
                path: "/settings/admin/user-commission",
              },
            ],
          },
          {
            id: "media",
            label: "Media",
            children: [
              { id: "news", label: "News", path: "/settings/media/news" },
              {
                id: "home-banner",
                label: "Home Banner",
                path: "/settings/media/banner",
              },
            ],
          },
          {
            id: "api-setting",
            label: "API Setting",
            children: [
              {
                id: "create-edit-products",
                label: "Create/Edit Products",
                path: "/settings/api/products",
              },
              {
                id: "create-api",
                label: "Create API",
                path: "/settings/api/create",
              },
              { id: "api-keys", label: "API Keys", path: "/settings/api/keys" },
              {
                id: "user-api-switch",
                label: "User API Switch",
                path: "/settings/api/user-switch",
              },
              {
                id: "product-api-switch",
                label: "Product API Switch",
                path: "/settings/api/product-switch",
              },
            ],
          },
          {
            id: "sales",
            label: "Sales",
            children: [
              { id: "by-api", label: "By API", path: "/settings/sales/api" },
              {
                id: "by-product",
                label: "By Product",
                path: "/settings/sales/product",
              },
              {
                id: "by-service",
                label: "By Service",
                path: "/settings/sales/service",
              },
              { id: "by-all", label: "By All", path: "/settings/sales/all" },
            ],
          },
          {
            id: "policy",
            label: "Policy",
            children: [
              {
                id: "refund-policy",
                label: "Refund Policy",
                path: "/settings/policy/refund",
              },
              {
                id: "privacy-policy",
                label: "Privacy Policy",
                path: "/settings/policy/privacy",
              },
              {
                id: "terms-conditions",
                label: "Terms Conditions",
                path: "/settings/policy/terms",
              },
            ],
          },
        ],
      },
      {
        id: "report",
        label: "Report",
        icon: BarChart3,
        path: "/report",
      },
      {
        id: "registration",
        label: "Registration",
        icon: UserPlus,
        children: [
          {
            id: "customers",
            label: "Customers",
            path: "/registration/customers",
          },
          {
            id: "customers-list",
            label: "Customers List",
            path: "/registration/customers-list",
          },
          {
            id: "customer-banks",
            label: "Customer Banks",
            path: "/registration/customer-banks",
          },
          {
            id: "customer-mapping",
            label: "Customer Mapping",
            path: "/registration/customer-mapping",
          },
        ],
      },
      {
        id: "transaction",
        label: "Transaction",
        icon: RefreshCw,
        children: [
          { id: "purchase", label: "Purchase", path: "/transaction/purchase" },
          {
            id: "request-order",
            label: "Request Order",
            path: "/transaction/request-order",
          },
          {
            id: "transfer-revert",
            label: "Transfer & Revert Bal",
            path: "/transaction/transfer-revert",
          },
        ],
      },
      {
        id: "help-desk",
        label: "Help Desk",
        icon: HelpCircle,
        children: [
          {
            id: "company-bank",
            label: "Company Bank",
            path: "/help-desk/company-bank",
          },
          {
            id: "service-onoff",
            label: "Service On/Off",
            path: "/help-desk/service-onoff",
          },
          {
            id: "dmt",
            label: "DMT",
            children: [
              { id: "dmt-pending", label: "Pending", path: "/transactions/dmt/pending" },
              { id: "dmt-completed", label: "Completed", path: "/transactions/dmt/completed" },
            ],
          },
          {
            id: "payment-gateway",
            label: "Payment Gateway",
            children: [
              { id: "pg-pending", label: "Pending", path: "/transactions/payment-gateway/pending" },
              { id: "pg-completed", label: "Completed", path: "/transactions/payment-gateway/completed" },
            ],
          },
          {
            id: "move-to-bank-pg",
            label: "Move To Bank PG",
            children: [
              { id: "mtb-pg-pending", label: "Pending", path: "/transactions/move-to-bank-pg/pending" },
              { id: "mtb-pg-completed", label: "Completed", path: "/transactions/move-to-bank-pg/completed" },
            ],
          },
          {
            id: "matm",
            label: "MATM",
            children: [
              { id: "matm-pending", label: "Pending", path: "/transactions/matm/pending" },
              { id: "matm-completed", label: "Completed", path: "/transactions/matm/completed" },
            ],
          },
        ],
      },
    ],
  },
  {
    role: "Admin",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: Home,
        path: "/dashboard",
      },
      {
        id: "master-report",
        label: "Master Report",
        icon: FileText,
        children: [
          { id: "ledger-report", label: "Ledger Report", path: "/master-report/ledger" },
          { id: "customer-ledger", label: "Customer Ledger", path: "/master-report/customer-ledger" },
          { id: "tds-gst", label: "TDS & GST", path: "/master-report/tds-gst" },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        children: [
          { id: "commission-setting", label: "Commission Setting", path: "/settings/commission" },
          { id: "user-commission", label: "User Commission", path: "/settings/user-commission" },
          { id: "news", label: "News", path: "/settings/news" },
          { id: "home-banner", label: "Home Banner", path: "/settings/banner" },
          { id: "create-api", label: "Create API", path: "/settings/create-api" },
          { id: "user-api-switch", label: "User API Switch", path: "/settings/user-api-switch" },
          { id: "product-api-switch", label: "Product API Switch", path: "/settings/product-api-switch" },
          { id: "create-edit-products", label: "Create/Edit Products", path: "/settings/products" },
          { id: "api-keys", label: "API Keys", path: "/settings/api-keys" },
          { id: "useful-links", label: "Usefull Links", path: "/settings/useful-links" },
        ],
      },
      {
        id: "pending-report",
        label: "Pending Report",
        icon: FileText,
        children: [
          { id: "pending-aeps", label: "Pending AEPS", path: "/report/pending/aeps" },
          { id: "pending-dmt", label: "Pending DMT", path: "/report/pending/dmt" },
          { id: "pending-recharge", label: "Pending Recharge", path: "/report/pending/recharge" },
          { id: "pending-pg", label: "Pending Payment Gateway", path: "/report/pending/pg" },
          { id: "pending-mtb", label: "Pending Move To Bank", path: "/report/pending/mtb" },
          { id: "pending-et", label: "Pending Express Transfer", path: "/report/pending/et" },
          { id: "pending-matm", label: "Pending MATM", path: "/report/pending/matm" },
        ],
      },
      {
        id: "transaction-report",
        label: "Transaction Report",
        icon: FileText,
        children: [
          { id: "aeps-tx", label: "AEPS Transaction", path: "/report/transaction/aeps" },
          { id: "dmt-tx", label: "DMT Transaction", path: "/report/transaction/dmt" },
          { id: "recharge-tx", label: "Recharge Transaction", path: "/report/transaction/recharge" },
          { id: "pg-tx", label: "Payment Gateway Transaction", path: "/report/transaction/pg" },
          { id: "mtb-tx", label: "Move To Bank Transaction", path: "/report/transaction/mtb" },
          { id: "et-tx", label: "Express Transfer Transaction", path: "/report/transaction/et" },
          { id: "matm-tx", label: "MATM Transaction", path: "/report/transaction/matm" },
        ],
      },
      {
        id: "registration",
        label: "Registration",
        icon: UserPlus,
        children: [
          { id: "customers", label: "Customers", path: "/registration/customers" },
          { id: "customers-list", label: "Customers List", path: "/registration/customers-list" },
          { id: "customer-banks", label: "Customer Banks", path: "/registration/customer-banks" },
          { id: "customer-mapping", label: "Customer Mapping", path: "/registration/customer-mapping" },
        ],
      },
      {
        id: "wallet",
        label: "Wallet",
        icon: RefreshCw,
        children: [
          { id: "purchase", label: "Purchase", path: "/wallet/purchase" },
          { id: "request-order", label: "Request Order", path: "/wallet/request-order" },
          { id: "transfer-revert", label: "Transfer & Revert Bal", path: "/wallet/transfer-revert" },
        ],
      },
      {
        id: "help-desk",
        label: "Help Desk",
        icon: HelpCircle,
        children: [
          { id: "company-bank", label: "Company Bank", path: "/help-desk/company-bank" },
          { id: "service-onoff", label: "Service On/Off", path: "/help-desk/service-onoff" },
          { id: "employees", label: "Employees", path: "/help-desk/employees" },
          { id: "solved-complain", label: "Solved Complain", path: "/help-desk/solved-complain" },
          { id: "pending-complain", label: "Pending Complain", path: "/help-desk/pending-complain" },
        ],
      },
    ],
  }

];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [activeItem, setActiveItem] = useState("dashboard");

  const userRole = getUserRole();

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const navigate = useNavigate();

  const handleItemClick = (itemId, path) => {
    setActiveItem(itemId);
    if (path) {
      navigate(path);
    }
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const isActive = activeItem === item.id;
    const Icon = item.icon;

    return (
      <div key={item.id}>
        <div
          onClick={() => {
            hasChildren
              ? toggleExpanded(item.id)
              : handleItemClick(item.id, item.path);
          }}
          className={`flex justify-between items-center py-2 px-4 cursor-pointer transition-all hover:bg-blue-50 ${
            isActive
              ? "bg-blue-100 border-r-4 border-blue-600 text-blue-700"
              : "text-gray-700"
          }`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5" />}
            <span className="font-medium">{item.label}</span>
          </div>
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            ))}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {item.children.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const currentMenu = menuItems.find((m) => m.role === userRole);

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-opacity-30 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
      <aside
        className={`fixed z-50 top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out
        ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:shadow-none w-[280px]`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 text-lg font-semibold text-blue-600">
            Admin Panel
          </div>

          <nav className="mt-4 flex-1 overflow-y-auto">
            {currentMenu?.items.map((item) => renderMenuItem(item))}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">A</span>
              </div>
              <div>
                <p className="font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">admin@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Shield,
  Users,
  Percent,
  Settings,
  Play,
  LogOut,
  History,
  Wallet,
  BadgeIndianRupee,
  FileCode,
  Building2,
  ChevronRight,
  Cog,
  FileCog,
} from "lucide-react";

import { useState } from "react";
import { useLogout } from "@/hooks/useAuth";
import Button from "./ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";
import { useQueryClient } from "@tanstack/react-query";

import { PERMISSIONS } from "@/lib/permissionKeys";
import { permissionChecker } from "@/lib/permissionCheker";
import { CreditCard } from "lucide-react";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { mutate: logoutMutate, isPending } = useLogout();
  const dispatch = useDispatch();
  const router = useRouter();

  const website = useSelector((state) => state.tenantWebsite.currentWebsite);
  const currentUser = useSelector((state) => state.auth.user);

  const perms = currentUser?.permissions;

  const can = (resource, action) => permissionChecker(perms, resource, action);

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLogout = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        dispatch(logoutAction());
        queryClient.clear();
        router.push("/login");
      },
    });
  };

  // ================= MENU CONFIG =================

  const menuSections = [
    {
      title: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: BarChart3,
          path: "/dashboard",
          permission: PERMISSIONS.DASHBOARD.READ,
        },
        {
          id: "fund-request",
          label: "Fund Request",
          icon: BadgeIndianRupee,
          path: "/dashboard/fund-request",
        },
        {
          id: "tenants",
          label: "Tenants",
          icon: Building2,
          path: "/dashboard/tenants",
          permission: PERMISSIONS.TENANT.READ,
        },
        {
          id: "user-management",
          label: "User Management",
          icon: Users,
          path: "/dashboard/user-management",
          permissionGroup: [PERMISSIONS.USER.READ, PERMISSIONS.ROLE.READ],
        },
        {
          id: "commission",
          label: "Commission",
          icon: Percent,
          path: "/dashboard/commission",
          permission: PERMISSIONS.COMMISSION.READ,
        },
        {
          id: "transactions",
          label: "Transactions",
          icon: History,
          path: "/dashboard/transactions",
        },
      ],
    },
    {
      title: "Services",
      items: [
        {
          id: "recharge",
          label: "Recharge",
          icon: CreditCard,
          path: "/dashboard/recharge",
          permission: PERMISSIONS.RECHARGE.READ,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          id: "request-kyc",
          label: "KYC Request",
          icon: Shield,
          path: "/dashboard/kyc-request",
        },
        {
          id: "employee-management",
          label: "Employee Management",
          icon: Users,
          path: "/dashboard/employee-management",
          permission: PERMISSIONS.EMPLOYEE.READ,
        },
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          path: "/dashboard/reports",
        },
        {
          id: "logs",
          label: "Logs",
          icon: FileCode,
          path: "/dashboard/logs",
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          id: "platform",
          label: "Platform",
          icon: Cog,
          path: "/dashboard/platform",
          permissionGroup: [
            PERMISSIONS.PLATFORM.SERVICES.READ,
            PERMISSIONS.PLATFORM.SERVICE_PROVIDERS.READ,
            PERMISSIONS.PLATFORM.SERVICE_TENANTS.READ,
          ],
        },

        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          path: "/dashboard/settings",
          permissionGroup: [
            PERMISSIONS.WEBSITE.READ,
            PERMISSIONS.SERVER.READ,
            PERMISSIONS.DOMAIN.READ,
            PERMISSIONS.SMTP.READ,
          ],
        },
      ],
    },
  ];

  // ================= COMPONENTS =================

  const MenuItem = ({ item }) => {
    const Icon = item.icon;

    const isActive = item.path && pathname.startsWith(item.path);

    // Parent with children
    if (item.children) {
      // 🔥 Auto-open if any child route matches
      const isAutoOpen = item.children.some((child) =>
        pathname.startsWith(child.path),
      );

      const isOpen = openMenus[item.id] || isAutoOpen;

      return (
        <div>
          <button
            onClick={() => toggleMenu(item.id)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-border text-sm font-medium hover:bg-(--sidebar-hover)"
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </div>

            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-90" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.path}
                  className={`block px-3 py-2 rounded-border text-sm ${
                    pathname === child.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-(--sidebar-hover)"
                  }`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Normal item
    return (
      <Link
        href={item.path}
        className={`flex items-center px-3 py-2.5 rounded-border text-sm font-medium ${
          isActive ? "bg-primary/10 text-primary" : "hover:bg-(--sidebar-hover)"
        }`}
      >
        <Icon className="h-5 w-5 mr-3" />
        {item.label}
      </Link>
    );
  };

  const MenuSection = ({ title, items }) => {
    const visibleItems = items.filter((item) => {
      if (item.permission)
        return can(item.permission.resource, item.permission.action);

      if (item.permissionGroup)
        return item.permissionGroup.some((perm) =>
          can(perm.resource, perm.action),
        );

      return true;
    });

    if (!visibleItems.length) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 px-3 text-muted-foreground">
          {title}
        </h3>
        <div className="space-y-1">
          {visibleItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  };

  // ================= UI =================

  return (
    <div className="h-full flex flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="px-6 py-2.5 bg-gradient-secondry border-b border-border">
        <div className="flex items-center gap-3">
          <Play className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-bold">{website?.brandName}</h2>
            <p className="text-xs text-muted-foreground">
              {currentUser?.role?.roleCode} Panel
            </p>
          </div>
        </div>
      </div>

      {/* Wallet */}
      {currentUser?.type !== "EMPLOYEE" && (
        <div className="p-4">
          <div className="bg-muted rounded-border p-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Wallet Balance
              </span>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold mt-1 text-primary">
              ₹{currentUser?.wallet?.balance}
            </p>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {menuSections.map((section) => (
          <MenuSection key={section.title} {...section} />
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10"
          icon={LogOut}
          loading={isPending}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

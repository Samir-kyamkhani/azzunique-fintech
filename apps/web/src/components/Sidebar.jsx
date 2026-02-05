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
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import Button from "./ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";
import { useQueryClient } from "@tanstack/react-query";

import { PERMISSIONS } from "@/lib/permissionKeys";
import { canServer } from "@/lib/permissionCheker";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { mutate: logoutMutate, isPending } = useLogout();
  const dispatch = useDispatch();
  const router = useRouter();

  const website = useSelector((state) => state.tenantWebsite.currentWebsite);
  const currentUser = useSelector((state) => state.auth.user);

  const perms = currentUser?.permissions;

  const can = (resource, action) => canServer(perms, resource, action);

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
          id: "add-fund",
          label: "Add Fund",
          icon: BadgeIndianRupee,
          path: "/dashboard/request-fund",
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
        { id: "logs", label: "Logs", icon: FileCode, path: "/dashboard/logs" },
      ],
    },
    {
      title: "System",
      items: [
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
    const isActive = pathname === item.path;

    return (
      <Link
        href={item.path}
        className={`group flex items-center px-3 py-2.5 rounded-border text-sm font-medium transition-all ${
          isActive
            ? "bg-primary/10 border border-primary/20 shadow-sm"
            : "hover:bg-(--sidebar-hover)"
        }`}
      >
        <Icon
          className={`h-5 w-5 mr-3 ${
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          }`}
        />
        <span
          className={
            isActive ? "text-primary font-semibold" : "text-muted-foreground"
          }
        >
          {item.label}
        </span>
      </Link>
    );
  };

  const MenuSection = ({ title, items }) => {
    const visibleItems = items.filter((item) => {
      if (item.permission) {
        return can(item.permission.resource, item.permission.action);
      }

      if (item.permissionGroup) {
        return item.permissionGroup.some((perm) =>
          can(perm.resource, perm.action),
        );
      }

      return true;
    });

    if (visibleItems.length === 0) return null;

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
    <div className="w-64 h-full flex flex-col border-r border-border bg-sidebar">
      <div className="px-6 py-2.5 bg-gradient-secondry border-b border-border shadow-border">
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

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {menuSections.map((section) => (
          <MenuSection
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}
      </div>

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

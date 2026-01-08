"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ArrowDownCircle,
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
} from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import Button from "./ui/Button";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";

const Sidebar = () => {
  const pathname = usePathname();
  const { mutate: logoutMutate, isPending } = useLogout();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        dispatch(logoutAction());
        router.push("/login");
      },
    });
  };

  const getPanelType = () => {
    return "";
  };

  const menuSections = [
    {
      title: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: BarChart3,
          path: "/dashboard",
        },
        {
          id: "add-fund",
          label: "Add Fund",
          icon: BadgeIndianRupee,
          path: "/dashboard/request-fund",
        },
        {
          id: "members",
          label: "Members",
          icon: Users,
          path: "/dashboard/members",
        },
        {
          id: "commission",
          label: "Commission",
          icon: Percent,
          path: "/dashboard/commission",
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
          id: "payout",
          label: "Payouts",
          icon: ArrowDownCircle,
          path: "/dashboard/card-payout",
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
          id: "settings",
          label: "Settings",
          icon: Settings,
          path: "/dashboard/settings",
        },
      ],
    },
  ];

  // Static user data (UI only)
  const userData = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    profileImage: "",
    wallets: [{ balance: 0 }],
    role: { name: "USER", type: "business" },
  };

  const MenuItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;

    return (
      <Link
        href={item.path}
        className={`group flex items-center px-3 py-2.5 rounded-border text-sm font-medium transition-all ${
          isActive
            ? "bg-primary/10 border border-primary/20 shadow-sm"
            : "hover:bg-[var(--sidebar-hover)]"
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

  const MenuSection = ({ title, items }) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 px-3 text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  const firstName = userData.firstName;
  const lastName = userData.lastName;
  const walletBalance = userData.wallets[0].balance;
  const initials = firstName ? firstName[0].toUpperCase() : "U";

  return (
    <div className="w-64 h-full flex flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="px-6 py-2.5 bg-gradient-secondry border-b border-border shadow-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-border flex items-center justify-center">
            <Play className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Payment System
            </h2>
            <p className="text-xs text-muted-foreground">User Panel</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4">
        <div className="glass rounded-xl border border-border overflow-hidden">
          {/* Wallet Section */}
          <div className="bg-muted rounded-border p-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Wallet Balance
              </span>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold mt-1 text-primary">
              ₹{walletBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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

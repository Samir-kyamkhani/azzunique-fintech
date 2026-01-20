"use client";

import { useState } from "react";
import {
  Shield,
  Bell,
  User,
  LogOut,
  Home,
  Settings,
  Users,
  Building,
  Wallet,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button.jsx";
import Link from "next/link";
import { useLogout } from "@/hooks/useAuth";
import dynamic from "next/dynamic";

export function Header() {
  const ThemeToggle = dynamic(() => import("./theme/ThemeToggle.jsx").then((m) => m.ThemeToggle),{ ssr: false });

  const { mutate: logoutMutate, isPending } = useLogout();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, user } = useSelector((state) => state.auth || {});

  const userType = user?.type || "USER";

  const handleLogout = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        dispatch(logoutAction());
        router.push("/login");
      },
      onSettled: () => {
        setIsProfileOpen(false);
      },
    });
  };

  const navigationLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Team",
      href: "/team",
      icon: Users,
    },
    {
      name: "Business",
      href: "/business",
      icon: Building,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const quickLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home, // ✅ Changed: Pass component, not JSX
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings, // ✅ Changed: Pass component, not JSX
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User, // ✅ Changed: Pass component, not JSX
    },
  ];

  // Static user data for UI (you can replace with actual user data)
  const userData = {
    name: user?.name || user?.identifier || "User",
    email: user?.email || "user@example.com",
    role: userType === "EMPLOYEE" ? "Employee" : "Business Admin",
    balance: 12500.75,
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-theme shadow-lg-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="shrink-0 flex items-center">
              <div className="p-2 bg-primary-foreground/20 rounded-border mr-3">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>

              <span className="text-primary-foreground font-bold text-xl">
                SecurePortal
              </span>

              {isAuthenticated && (
                <span className="ml-3 px-2 py-1 text-xs bg-primary-foreground/20 text-primary-foreground rounded-full">
                  {userType === "EMPLOYEE" ? "Employee" : "User"}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-4">
              {navigationLinks.map((link) => (
                <Button
                  key={link.name}
                  href={link.href}
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  icon={link.icon}
                >
                  {link.name}
                </Button>
              ))}
            </nav>
          )}

          {/* Right side - User actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
                </Button>

                {/* Profile dropdown - Only for authenticated users */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    icon={User}
                  >
                    <span className="hidden md:inline">{userData.name}</span>
                  </Button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-popover rounded-lg-border shadow-lg border border-border z-50">
                      {/* User Info */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-theme rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                            {userData.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-popover-foreground">
                              {userData.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {userData.email}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-accent rounded-border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Wallet Balance
                            </span>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-lg font-bold text-popover-foreground mt-1">
                            ₹{userData.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="p-2">
                        {quickLinks.map((link) => (
                          <Button
                            key={link.label}
                            href={link.href}
                            variant="ghost"
                            className="w-full justify-start"
                            icon={link.icon}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            {link.label}
                          </Button>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="p-3 border-t border-border">
                        <Button
                          variant="default"
                          className="w-full"
                          icon={LogOut}
                          loading={isPending}
                          onClick={handleLogout}
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // For non-authenticated users (public header)
              <div className="flex items-center space-x-3">
                <Button
                  href="/login"
                  variant="secondary"
                  className="text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10"
                >
                  Sign In
                </Button>
                <Button
                  href="/register"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

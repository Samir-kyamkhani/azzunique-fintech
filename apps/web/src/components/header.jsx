"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Home,
  Settings,
  Users,
  Building,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./theme/ThemeToggle";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme } = useTheme();

  const { isAuthenticated, user } = useSelector((state) => state.auth || {});

  const userType = user?.type || "USER";

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const navigationLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    { name: "Team", href: "/team", icon: <Users className="h-4 w-4" /> },
    {
      name: "Business",
      href: "/business",
      icon: <Building className="h-4 w-4" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-theme shadow-lg-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="shrink-0 flex items-center">
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
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-border transition-colors"
                >
                  {link.icon}
                  <span className="ml-2">{link.name}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Right side - User actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <button className="relative p-2 text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-border transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-border transition-colors"
                  >
                    <div className="h-8 w-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.name || user?.identifier || "User"}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg-border shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-popover-foreground">
                          {user?.name || user?.identifier}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {userType === "EMPLOYEE"
                            ? "Employee Account"
                            : "User Account"}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-accent"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground border border-primary-foreground/30 rounded-border hover:bg-primary-foreground/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-foreground text-primary rounded-border hover:bg-primary-foreground/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-border transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/20">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center px-3 py-3 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded-border transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.icon}
                    <span className="ml-3">{link.name}</span>
                  </Link>
                ))}
                <div className="pt-2 mt-2 border-t border-primary-foreground/20">
                  <ThemeToggle />
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-3 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded-border transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span className="ml-3">Your Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10 rounded-border transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-3">Sign out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/login"
                  className="px-4 py-3 text-center font-medium text-primary-foreground border border-primary-foreground/30 rounded-border hover:bg-primary-foreground/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-3 text-center font-medium bg-primary-foreground text-primary rounded-border hover:bg-primary-foreground/90 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

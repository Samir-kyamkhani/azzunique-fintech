"use client";

import { useState } from "react";
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

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // Get user from Redux store (adjust based on your actual auth state structure)
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
    <header className="sticky top-0 z-50 bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-700 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="shrink-0 flex items-center">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">SecurePortal</span>
              {isAuthenticated && (
                <span className="ml-3 px-2 py-1 text-xs bg-white/20 text-white rounded-full">
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
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                {/* Notifications */}
                <button className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.name || user?.identifier || "User"}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name || user?.identifier}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userType === "EMPLOYEE"
                            ? "Employee Account"
                            : "User Account"}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Your Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
                  className="px-4 py-2 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
          <div className="md:hidden py-4 border-t border-white/20">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center px-3 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.icon}
                    <span className="ml-3">{link.name}</span>
                  </Link>
                ))}
                <div className="pt-2 mt-2 border-t border-white/20">
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span className="ml-3">Your Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-3 py-3 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
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
                  className="px-4 py-3 text-center font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-3 text-center font-medium bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
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

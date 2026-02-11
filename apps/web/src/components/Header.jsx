"use client";

import { Home, Users, Building } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useLogout } from "@/hooks/useAuth";
import dynamic from "next/dynamic";
import { useWebsite } from "@/hooks/useTenantWebsite";
import Image from "next/image";

export default function Header() {
  const ThemeToggle = dynamic(
    () => import("./theme/ThemeToggle").then((m) => m.ThemeToggle),
    { ssr: false },
  );

  const { mutate: logoutMutate, } = useLogout();
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated } = useSelector((state) => state.auth || {});

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
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "About Us",
      href: "/about-us",
      icon: Users,
    },
    {
      name: "Services",
      href: "/services",
      icon: Building,
    },
  ];

  const website = useWebsite();

  return (
    <header className="sticky top-0 z-50 bg-gradient-theme">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="shrink-0 flex items-center">
              {website?.logoUrl ? (
                <Image
                  width={100}
                  height={100}
                  src={website?.logoUrl}
                  alt={"Logo"}
                  className="h-8 w-8 mr-2 object-contain"
                />
              ) : (
                <span className="text-primary-foreground font-bold text-xl">
                  {website?.brandName}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
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

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Button href={"/dashboard"}>Dashboard</Button>
                <button
                  onClick={handleLogout}
                  className={"bg-red-600 py-2 px-3 rounded-sm"}
                >
                  Logout
                </button>
              </>
            ) : (
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

"use client";

import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";
import { Eye, EyeOff, Shield, Building, Users, Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { mutate, isPending, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("USER");

  const { register, handleSubmit } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
      type: "USER",
    },
  });

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (res) => {
        dispatch(loginSuccess(res));
        router.push("/dashboard");
      },
    });
  };

  const handleTabClick = (tabValue) => {
    setActiveTab(tabValue);
    const select = document.getElementById("type");
    if (select) select.value = tabValue;
  };

  return (
    <div className="flex items-center justify-center bg-gradient-light min-h-screen p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header with Gradient */}
        <div className="bg-gradient-theme px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary-foreground/20 rounded-full">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Sign in to your account to continue
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <div className="flex">
            <button
              type="button"
              onClick={() => handleTabClick("USER")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "USER"
                  ? "text-primary border-b-2 border-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                User
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleTabClick("EMPLOYEE")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "EMPLOYEE"
                  ? "text-primary border-b-2 border-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Building className="h-4 w-4" />
                Employee
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Error Messages */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-border mb-4">
              <p className="text-destructive-foreground text-sm font-medium">
                {error.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {activeTab === "EMPLOYEE" ? "Employee ID" : "User ID"} *
              </label>
              <input
                {...register("identifier")}
                autoComplete="username"
                required
                className="w-full px-3 py-2 border border-input bg-background rounded-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                placeholder={
                  activeTab === "EMPLOYEE"
                    ? "Enter your Employee ID"
                    : "Enter your User ID"
                }
                disabled={isPending}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-1">
                Password *
              </label>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                placeholder="Enter your password"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isPending}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Hidden select for form submission */}
            <select {...register("type")} id="type" className="hidden">
              <option value="USER">User</option>
              <option value="EMPLOYEE">Employee</option>
            </select>

            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-3 bg-gradient-theme text-primary-foreground rounded-border hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Signing in...
                </div>
              ) : (
                `Sign In as ${activeTab === "EMPLOYEE" ? "Employee" : "User"}`
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center text-muted-foreground mb-2">
                <Lock className="h-3 w-3 mr-1" />
                <p className="text-xs">Your credentials are secure</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeTab === "EMPLOYEE"
                  ? "Use your Employee ID to login"
                  : "Use your User ID to login"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

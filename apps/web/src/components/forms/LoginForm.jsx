"use client";

import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";
import { Eye, EyeOff, Shield, Building, Users, Lock } from "lucide-react";
import { useState } from "react";

export default function LoginForm() {
  const dispatch = useDispatch();
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
      },
    });
  };

  const handleTabClick = (tabValue) => {
    setActiveTab(tabValue);
    const select = document.getElementById("type");
    if (select) select.value = tabValue;
  };

  return (
    <div className="flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 min-h-screen p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header with Gradient */}
        <div className="bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-700 px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-blue-100 text-sm">
              Sign in to your account to continue
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              type="button"
              onClick={() => handleTabClick("USER")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "USER"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-700 text-sm font-medium">
                {error.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeTab === "EMPLOYEE" ? "Employee ID" : "User ID"} *
              </label>
              <input
                {...register("identifier")}
                autoComplete="username"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder={
                  activeTab === "EMPLOYEE"
                    ? "Enter your Employee ID"
                    : "Enter your User ID"
                }
                disabled={isPending}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
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
              className="w-full px-4 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                `Sign In as ${activeTab === "EMPLOYEE" ? "Employee" : "User"}`
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-500 mb-2">
                <Lock className="h-3 w-3 mr-1" />
                <p className="text-xs">Your credentials are secure</p>
              </div>
              <p className="text-xs text-gray-500">
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

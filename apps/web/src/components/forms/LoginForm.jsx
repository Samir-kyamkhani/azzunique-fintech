"use client";

import { useForm } from "react-hook-form";
import { Eye, EyeOff, Shield, Building, Users, Lock } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button.jsx";
import InputField from "@/components/ui/InputField.jsx";

export default function LoginForm({ login, isPending }) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("USER");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
      type: "USER",
    },
  });

  const onSubmit = (data) => {
    login(data, setError);
  };

  const handleTabClick = (tabValue) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="bg-card border border-border rounded-lg-border shadow-xl w-full max-w-md overflow-hidden">
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
          <p className="text-primary-foreground/90 text-sm">
            Sign in to your account to continue
          </p>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex">
          <button
            type="button"
            onClick={() => handleTabClick("USER")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "USER"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
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
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building className="h-4 w-4" />
              Employee
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        {errors?.root && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-border mb-4">
            <p className=" text-sm font-medium text-red-500 leading-tight">
              {errors.root.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label={activeTab === "EMPLOYEE" ? "Employee ID" : "User ID"}
            name="identifier"
            register={register}
            required
            disabled={isPending}
            autoComplete="username"
            placeholder={
              activeTab === "EMPLOYEE"
                ? "Enter your Employee ID"
                : "Enter your User ID"
            }
            error={errors.identifier}
          />

          <InputField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            register={register}
            required
            disabled={isPending}
            autoComplete="current-password"
            placeholder="Enter your password"
            rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onRightIconClick={() => setShowPassword((prev) => !prev)}
            error={errors.password}
          />

          <select {...register("type")} id="type" className="hidden">
            <option value="USER">User</option>
            <option value="EMPLOYEE">Employee</option>
          </select>

          <Button
            type="submit"
            disabled={isPending}
            loading={isPending}
            className="w-full"
          >
            {isPending
              ? "Signing in..."
              : `Sign In as ${activeTab === "EMPLOYEE" ? "Employee" : "User"}`}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center">
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
  );
}

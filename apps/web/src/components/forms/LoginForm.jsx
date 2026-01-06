"use client";

import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";

export default function LoginForm() {
  const dispatch = useDispatch();
  const { mutate, isPending, error } = useLogin();

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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4"
    >
      <input
        {...register("identifier")}
        placeholder="User Id / Employee ID"
        className="w-full border p-2"
      />

      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        className="w-full border p-2"
      />

      <select {...register("type")} className="w-full border p-2">
        <option value="USER">User</option>
        <option value="EMPLOYEE">Employee</option>
      </select>

      {error && <p className="text-red-500 text-sm">{error.message}</p>}

      <button
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2"
      >
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

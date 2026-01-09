"use client";

import { useLogin } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import LoginForm from "../forms/LoginForm";

export default function LoginClient() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutate, isPending } = useLogin();

  const login = (data, setError) => {
    mutate(data, {
      onSuccess: (res) => {
        dispatch(loginSuccess(res));
        router.push("/dashboard");
      },
      onError: (err) => {
        if (err.type === "FIELD") {
          err.errors.forEach(({ field, message }) => {
            setError(field, { message });
          });
          return;
        }   

        setError("root", { message: err.message });
      },
    });
  };

  return <LoginForm login={login} isPending={isPending} />;
}

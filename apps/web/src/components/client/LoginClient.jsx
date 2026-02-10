"use client";

import { useEffect } from "react";
import { useLogin, useMe } from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { loginSuccess, setUserFromMe } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import LoginForm from "../forms/LoginForm";

export default function LoginClient() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutate, isPending } = useLogin();

  const { data: meRes, refetch } = useMe();

  useEffect(() => {
    if (meRes?.data) {
      dispatch(setUserFromMe(meRes.data));
      router.push("/dashboard");
    }
  }, [meRes, dispatch, router]);

  const login = (data, setError) => {
    mutate(data, {
      onSuccess: (res) => {
        dispatch(loginSuccess(res));
        refetch();
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

"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTenantWebsite } from "@/hooks/useTenantWebsite";
import { setTenantWebsite } from "@/store/tenantWebsiteSlice";
import { useMe } from "@/hooks/useAuth";
import { setUserFromMe } from "@/store/authSlice";

export default function TenantBootstrap({ children }) {
  const dispatch = useDispatch();
  const { data, isLoading } = useTenantWebsite();
  const website = data?.data;

  const { data: meRes } = useMe();

  useEffect(() => {
    if (meRes?.data) {
      dispatch(setUserFromMe(meRes.data));
    }
  }, [meRes, dispatch]);

  useEffect(() => {
    if (!website) return;

    dispatch(setTenantWebsite(website));

    const root = document.documentElement;

    if (website.primaryColor) {
      root.style.setProperty("--primary", website.primaryColor);
      root.style.setProperty("--theme-primary", website.primaryColor);
      root.style.setProperty("--ring", website.primaryColor);

      root.style.setProperty(
        "--gradient-primary",
        `linear-gradient(to right, ${website.primaryColor}, ${website.primaryColor}cc)`,
      );

      root.style.setProperty(
        "--theme-gradient",
        `linear-gradient(to right, ${website.primaryColor}, ${website.primaryColor}cc)`,
      );
    }

    if (website.secondaryColor) {
      root.style.setProperty("--secondary", website.secondaryColor);
    }

    if (!document.cookie.includes("tenantWebsite=1")) {
      document.cookie = "tenantWebsite=1; path=/; max-age=86400; samesite=lax";
    }
  }, [website, dispatch]);

  if (isLoading) return null;

  return (
    <>
      {website?.favIconUrl && <link rel="icon" href={website.favIconUrl} />}
      <title>{website?.brandName ?? "Website"}</title>
      {children}
    </>
  );
}

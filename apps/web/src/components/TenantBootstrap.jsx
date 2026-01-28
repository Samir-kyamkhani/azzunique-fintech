"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTenantWebsite } from "@/hooks/useTenantWebsite";
import { setTenantWebsite } from "@/store/tenantWebsiteSlice";

export default function TenantBootstrap({ children }) {
  const dispatch = useDispatch();
  const { data, isLoading } = useTenantWebsite();
  const website = data?.data;

  /* ================= SAVE TO REDUX ================= */
  useEffect(() => {
    if (website) dispatch(setTenantWebsite(website));
  }, [website, dispatch]);

  /* ================= APPLY BRAND THEME ================= */
  useEffect(() => {
    if (!website) return;

    const root = document.documentElement;
    const primary = website.primaryColor;
    const secondary = website.secondaryColor || primary;

    if (primary) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--theme-primary", primary);
      root.style.setProperty("--ring", primary);
      root.style.setProperty("--sidebar-primary", primary);
      root.style.setProperty("--info", primary);

      // 🔥 Auto text contrast fix
      root.style.setProperty(
        "--primary-foreground",
        isColorDark(primary) ? "#ffffff" : "#000000",
      );
    }

    if (secondary) {
      root.style.setProperty("--secondary", secondary);
      root.style.setProperty("--accent", secondary);
    }
  }, [website]);

  if (isLoading) return null;

  return (
    <>
      {website?.favIconUrl && <link rel="icon" href={website.favIconUrl} />}
      <title>{website?.brandName ?? "Website"}</title>
      {children}
    </>
  );
}

/* ================= COLOR CONTRAST HELPER ================= */
function isColorDark(hex) {
  if (!hex) return false;

  const c = hex.replace("#", "");
  const rgb = parseInt(c, 16);

  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 140; // threshold
}

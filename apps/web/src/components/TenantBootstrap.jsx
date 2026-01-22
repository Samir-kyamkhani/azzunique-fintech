"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTenantWebsite } from "@/hooks/useTenantWebsite";
import { setTenantWebsite } from "@/store/tenantWebsiteSlice";

export default function TenantBootstrap({ children }) {
  const dispatch = useDispatch();
  const { data: website, isLoading } = useTenantWebsite();

  useEffect(() => {
    if (website) {
      dispatch(setTenantWebsite(website));
    }
  }, [website, dispatch]);

  if (isLoading) return null;

  return (
    <>
      {/* favicon */}
      {website?.favIconUrl && <link rel="icon" href={website.favIconUrl} />}

      {/* title */}
      <title>{website?.siteTitle ?? "Website"}</title>

      {children}
    </>
  );
}

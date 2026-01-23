"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTenantWebsite } from "@/hooks/useTenantWebsite";
import { setTenantWebsite } from "@/store/tenantWebsiteSlice";

export default function TenantBootstrap({ children }) {
  const dispatch = useDispatch();
  const { data, isLoading } = useTenantWebsite();

  useEffect(() => {
    if (data?.data) {
      dispatch(setTenantWebsite(data.data));
    }
  }, [data, dispatch]);

  if (isLoading) return null;

  return (
    <>
      {/* favicon */}
      {data?.data?.favIconUrl && (
        <link rel="icon" href={data.data.favIconUrl} />
      )}

      {/* title */}
      <title>{data?.data?.brandName ?? "Website"}</title>

      {children}
    </>
  );
}

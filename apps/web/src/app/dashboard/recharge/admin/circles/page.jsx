import CircleMapsClient from "@/components/client/CircleMapsClient";
import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export const metadata = {
  title: "Circle Maps",
};

export default function CircleMapsPage() {
  return (
    <ClientGuard anyOf={[PERMISSIONS.SERVICES_PAGES.RECHARGE.ADMIN.CIRCLES.READ]}>
      <CircleMapsClient />
    </ClientGuard>
  );
}

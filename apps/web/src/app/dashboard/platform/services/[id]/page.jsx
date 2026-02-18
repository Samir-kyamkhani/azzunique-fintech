import PlatformServiceDetailsClient from "@/components/client/PlatformServiceDetailsClient";
import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export const metadata = {
  title: "Platform Service Details",
};

export default async function PlatformServiceDetailsPage({ params }) {
  const { id } = await params;

  return (
    <ClientGuard anyOf={[PERMISSIONS.PLATFORM.SERVICES.READ]}>
      <PlatformServiceDetailsClient id={id} />
    </ClientGuard>
  );
}

import RechargeClient from "@/components/client/RechargeClient";
import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export const metadata = {
  title: "Recharge",
};

export default function RechargePage() {
  return (
    <ClientGuard anyOf={[PERMISSIONS.RECHARGE.CREATE]}>
      <RechargeClient />
    </ClientGuard>
  );
}

import OperatorMapsClient from "@/components/client/OperatorMapsClient";
import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export const metadata = {
  title: "Operator Maps",
};

export default function OperatorMapsPage() {
  return (
    <ClientGuard anyOf={[PERMISSIONS.RECHARGE.ADMIN.OPERATORS.READ]}>
      <OperatorMapsClient />
    </ClientGuard>
  );
}

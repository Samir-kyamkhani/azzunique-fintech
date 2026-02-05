import Guard from "@/components/Guard";
import SettingsAccordion from "@/components/SettingsAccordion";
import { PERMISSIONS } from "@/lib/permissionKeys";

export const metadata = {
  title: "Setting General",
  description: "Sign in to your account",
};

export default async function Page() {
  return (
    <Guard
      anyOf={[PERMISSIONS.WEBSITE.READ, PERMISSIONS.SOCIAL_MEDIA.READ]}
      fallback={<div className="p-6">403 - Not allowed</div>}
    >
      <SettingsAccordion />
    </Guard>
  );
}

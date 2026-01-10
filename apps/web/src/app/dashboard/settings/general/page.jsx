import TenantSocialMediaClient from "@/components/client/TenantSocialMediaClient";
import TenantWebsiteClient from "@/components/client/TenantWebsiteClient";

export const metadata = {
  title: "Setting General",
  description: "Sign in to your account",
};

export default async function Page() {
  return (
    <div className="space-y-12">
      <TenantWebsiteClient />
      <TenantSocialMediaClient />
    </div>
  );
}

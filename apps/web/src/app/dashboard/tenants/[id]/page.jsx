import { redirect } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;

  if (!id) {
    redirect("/dashboard/tenants");
  }

  redirect(`/dashboard/tenants/${id}/overview`);
}

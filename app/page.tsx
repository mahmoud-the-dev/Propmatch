import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PropertyDashboard } from "@/components/property-dashboard";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <PropertyDashboard />;
}

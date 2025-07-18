import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddPropertyForm } from "@/components/add-property-form";
import { getPropertyTypes } from "@/app/actions/property-actions";

export default async function AddPropertyPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const propertyTypes = await getPropertyTypes();

  return <AddPropertyForm propertyTypes={propertyTypes} />;
} 
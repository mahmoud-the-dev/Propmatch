import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { EditPropertyForm } from "@/components/edit-property-form";
import { getPropertyTypes } from "@/app/actions/property-actions";

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  // Fetch the property data and property types in parallel
  const [propertyResult, propertyTypes] = await Promise.all([
    supabase
      .from('Property')
      .select(`
        *,
        PropertyType(name),
        PropertyImage(image_url)
      `)
      .eq('id', params.id)
      .eq('user_id', data.claims.sub) // Ensure user owns this property
      .single(),
    getPropertyTypes()
  ]);

  const { data: property, error: propertyError } = propertyResult;

  if (propertyError || !property) {
    notFound();
  }

  return <EditPropertyForm property={property} propertyTypes={propertyTypes} />;
} 
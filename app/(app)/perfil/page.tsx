import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = { title: "Editar perfil — BookiDesk" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_color")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-md px-4 py-6 md:px-8">
      <PageHeader title="Editar perfil" />
      <div className="mt-6">
        <ProfileForm
          initialName={profile?.display_name ?? ""}
          initialColor={profile?.avatar_color ?? "#722033"}
          email={user.email ?? ""}
        />
      </div>
    </div>
  );
}

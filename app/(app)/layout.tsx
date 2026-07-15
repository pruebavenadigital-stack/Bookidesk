import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/nav/app-shell";
import { IntroGate } from "@/components/intro/intro-gate";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <>
      <IntroGate />
      <AppShell
        profile={{
          displayName: profile?.display_name ?? "Lector",
          avatarColor: profile?.avatar_color ?? "#722033",
          email: user.email ?? "",
        }}
      >
        {children}
      </AppShell>
    </>
  );
}

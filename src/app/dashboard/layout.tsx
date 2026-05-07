import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentProfile } from "@/lib/supabase/queries";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={profile.role} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Topbar
          role={profile.role}
          firstName={profile.first_name || "User"}
          lastName={profile.last_name || ""}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

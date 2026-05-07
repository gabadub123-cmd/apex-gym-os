import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getDemoProfile } from "@/hooks/use-user";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = getDemoProfile("coach");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={profile.role} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Topbar
          role={profile.role}
          firstName={profile.first_name}
          lastName={profile.last_name}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

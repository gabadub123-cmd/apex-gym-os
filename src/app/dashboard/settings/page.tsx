import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/supabase/queries";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Profile Information
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {profile.role.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <SettingsForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">User ID</p>
              <p className="text-xs text-muted-foreground font-mono">
                {profile.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

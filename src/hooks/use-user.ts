import type { Profile } from "@/lib/types/database";

const DEMO_PROFILES: Record<string, Profile> = {
  admin: {
    id: "00000000-0000-0000-0000-000000000001",
    role: "admin",
    first_name: "Admin",
    last_name: "User",
    email: "admin@apexgym.com",
    phone: null,
    avatar_url: null,
    date_of_birth: "1990-01-15",
    gender: "male",
    bio: null,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  coach: {
    id: "00000000-0000-0000-0000-000000000002",
    role: "coach",
    first_name: "Marcus",
    last_name: "Rivera",
    email: "marcus@apexgym.com",
    phone: null,
    avatar_url: null,
    date_of_birth: "1988-06-22",
    gender: "male",
    bio: null,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export function getDemoProfile(role: "admin" | "coach" = "coach"): Profile {
  return DEMO_PROFILES[role];
}

import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  UtensilsCrossed,
  Settings,
  ShoppingBag,
  MessageSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/types/database";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "coach", "client"],
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: Users,
    roles: ["admin", "coach"],
  },
  {
    label: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
    roles: ["admin", "coach", "client"],
  },
  {
    label: "Training",
    href: "/dashboard/training",
    icon: Dumbbell,
    roles: ["admin", "coach", "client"],
  },
  {
    label: "Nutrition",
    href: "/dashboard/nutrition",
    icon: UtensilsCrossed,
    roles: ["admin", "coach", "client"],
  },
  {
    label: "Admin",
    href: "/dashboard/admin",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    label: "Shop",
    href: "/dashboard/shop",
    icon: ShoppingBag,
    roles: ["admin"],
  },
  {
    label: "Community",
    href: "/dashboard/community",
    icon: MessageSquare,
    roles: ["admin", "coach", "client"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "coach", "client"],
  },
];

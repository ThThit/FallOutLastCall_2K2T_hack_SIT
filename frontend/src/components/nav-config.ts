import { Radio, Package, Archive, Users, Map, UserCircle, Vault } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavRoute {
  /** Route path (also the source of truth for the active state). */
  path: string;
  icon: LucideIcon;
  /** Label shown in the desktop sidebar. */
  sidebarLabel: string;
  /** Label shown in the mobile bottom nav. Omit to hide from mobile nav. */
  mobileLabel?: string;
  /** Header title + subtitle rendered by the layout for this route. */
  title: string;
  subtitle: string;
}

export const navRoutes: NavRoute[] = [
  {
    path: "/signals",
    icon: Radio,
    sidebarLabel: "SIGNAL FEED",
    mobileLabel: "FEED",
    title: "SIGNAL FEED",
    subtitle: "Real-time survivor broadcasts",
  },
  {
    path: "/vault",
    icon: Vault,
    sidebarLabel: "VAULT",
    mobileLabel: "VAULT",
    title: "PERSONAL VAULT",
    subtitle: "Your protected inventory storage",
  },
  {
    path: "/market",
    icon: Package,
    sidebarLabel: "MARKET",
    mobileLabel: "MARKET",
    title: "RESOURCE MARKET",
    subtitle: "Essential supplies for trade",
  },
  {
    path: "/memories",
    icon: Archive,
    sidebarLabel: "ARCHIVE",
    title: "MEMORY ARCHIVE",
    subtitle: "Messages from the fallen",
  },
  {
    path: "/survivors",
    icon: Users,
    sidebarLabel: "SURVIVORS",
    title: "SURVIVOR PROFILE",
    subtitle: "Your network profile",
  },
  {
    path: "/sectors",
    icon: Map,
    sidebarLabel: "SECTORS",
    mobileLabel: "MAP",
    title: "SECTOR MAP",
    subtitle: "Tactical zone overview",
  },
  {
    path: "/settings",
    icon: UserCircle,
    sidebarLabel: "ABOUT ME",
    mobileLabel: "ABOUT",
    title: "ABOUT ME",
    subtitle: "Account & preferences",
  },
];

/** Path that the app lands on by default / falls back to. */
export const DEFAULT_ROUTE = "/signals";

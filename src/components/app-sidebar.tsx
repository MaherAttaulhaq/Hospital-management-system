"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { useHasPermission } from "@/hooks/use-has-permission";
import { UserRole } from "@/db/schemas";
import { checkPermissions,Resource, Permission } from "@/lib/permissions";
import { NavUser } from "./nav-user";

type User = {
  name: string;
  email: string;
  image: string;
  role: UserRole;
};
type Session = {
  user: User;
  expires: string;
};

const initialNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
    resource: null, // No specific resource, always visible
    permission: null,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: IconListDetails,
    resource: "User",
    permission: "read",
  },
  {
    title: "Doctors",
    url: "/dashboard/doctors",
    icon: IconChartBar,
    resource: "Doctor",
    permission: "read",
  },
  {
    title: "Patients",
    url: "/dashboard/patients",
    icon: IconFolder,
    resource: "Patient",
    permission: "read",
  },
  {
    title: "Billings",
    url: "/dashboard/billings",
    icon: IconDatabase,
    resource: "Billing",
    permission: "read", // Admin can read all, Patient can read own (handled by API)
  },
  {
    title: "Appointments",
    url: "/dashboard/appointments",
    icon: IconFileDescription,
    resource: "Appointment",
    permission: "read", // Admin can read all, Doctor readAssigned, Patient createOwn (proxy for readOwn)
  },
  {
    title: "Pharmacy",
    url: "/dashboard/pharmacy",
    icon: IconFileAi,
    resource: "Pharmacy",
    permission: "read",
  },
  {
    title: "Prescriptions",
    url: "/dashboard/prescriptions",
    icon: IconFileWord,
    resource: "Prescription",
    permission: "read", // Admin can read all, Doctor createForOwnPatients (proxy for read for own patients), Patient readOwnPrescriptions
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [userNav, setUserNav] = React.useState({
    name: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    const user = session?.user as User;
    if (user) {
      setUserNav({
        name: user.name ?? "Guest",
        email: user.email ?? "",
        avatar: user.image ?? "/avatars/default.png",
      });
    }
  }, [session]);

  const filteredNavMain = useMemo(() => {
    if (!session || !session.user || !session.user.role) {
      return [];
    }

    const userRole = session.user.role as UserRole;

    return initialNavItems.filter((item) => {
      if (!item.resource) {
        return true; // Always show items without a specific resource
      }
      // Special handling for permissions that are not just "read" for listing
      if (item.resource === "Billing" && item.permission === "read") {
        return checkPermissions(userRole, item.resource as Resource, "read") || checkPermissions(userRole, item.resource as Resource, "readOwn");
      }
      if (item.resource === "Appointment" && item.permission === "read") {
        return checkPermissions(userRole, item.resource as Resource, "read") || checkPermissions(userRole, item.resource as Resource, "readAssigned") || checkPermissions(userRole, item.resource as Resource, "createOwn");
      }
      if (item.resource === "Prescription" && item.permission === "read") {
        return checkPermissions(userRole, item.resource as Resource, "read") || checkPermissions(userRole, item.resource as Resource, "createForOwnPatients") || checkPermissions(userRole, item.resource as Resource, "readOwnPrescriptions");
      }
      return checkPermissions(userRole, item.resource as Resource, item.permission as Permission);
    });
  }, [session]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Indus Hospital Jubilee town,Lahore
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userNav} />
      </SidebarFooter>
    </Sidebar>
  );
}

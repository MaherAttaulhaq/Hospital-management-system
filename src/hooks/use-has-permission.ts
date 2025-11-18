import { useSession } from "next-auth/react";
import {
  checkPermissions as hasPermission,
  Role,
  Resource,
  PermissionAction,
} from "@/lib/rbac";

export function useHasPermission(
  resource: string,
  permission: PermissionAction
): boolean {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return false; // Or handle loading state as appropriate
  }

  if (!session || !session.user || !session.user.role) {
    return false;
  }

  const userRole = session.user.role as Role;
  const resourceName = resource as Resource;

  return hasPermission(userRole, resourceName, permission);
}

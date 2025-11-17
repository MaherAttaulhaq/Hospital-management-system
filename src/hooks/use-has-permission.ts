import { useSession } from "next-auth/react";
import { checkPermissions } from "@/lib/permissions";
import { UserRole } from "@/db/schemas";

type Resource =
  | "Doctor"
  | "Patient"
  | "Appointment"
  | "Prescription"
  | "Billing"
  | "Pharmacy";

type Permission =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "readOwn"
  | "updateOwn"
  | "createOwn"
  | "cancelOwn"
  | "updateStatus"
  | "readAssigned"
  | "createForOwnPatients"
  | "updateForOwnPatients"
  | "readOwnPrescriptions";

export function useHasPermission(resource: Resource, permission: Permission): boolean {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return false; // Or handle loading state as appropriate
  }

  if (!session || !session.user || !session.user.role) {
    return false;
  }

  const userRole = session.user.role as UserRole;
  return checkPermissions(userRole, resource, permission);
}

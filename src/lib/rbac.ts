
import { z } from "zod";

export const roles = ["admin", "doctor", "patient"] as const;
export const RoleSchema = z.enum(roles);
export type Role = z.infer<typeof RoleSchema>;

export type Resource = "doctors" | "patients" | "appointments" | "prescriptions" | "billings" | "pharmacy";
export type PermissionAction = "create" | "update" | "delete" | "read";

export const permissions: Record<Resource, Record<PermissionAction, readonly Role[]>> = {
  doctors: {
    create: ["admin"],
    update: ["admin", "doctor"],
    delete: ["admin"],
    read: ["admin", "doctor"],
  },
  patients: {
    create: ["admin"],
    update: ["admin", "patient"],
    delete: ["admin"],
    read: ["admin", "doctor", "patient"],
  },
  appointments: {
    create: ["admin", "patient"],
    update: ["admin", "doctor"],
    delete: ["admin", "patient"],
    read: ["admin", "doctor", "patient"],
  },
  prescriptions: {
    create: ["doctor"],
    update: ["doctor"],
    delete: [],
    read: ["admin", "doctor", "patient"],
  },
  billings: {
    create: ["admin"],
    update: ["admin"],
    delete: ["admin"],
    read: ["admin", "patient"],
  },
  pharmacy: {
    create: ["admin"],
    update: ["admin"],
    delete: ["admin"],
    read: ["admin", "doctor", "patient"],
  },
};

export function hasPermission(
  role: Role,
  resource: Resource,
  action: PermissionAction
) {
  if (!role) {
    return false;
  }
  const allowedRoles = permissions[resource][action];
  return allowedRoles.includes(role);
}

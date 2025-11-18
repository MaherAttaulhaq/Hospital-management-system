import { z } from "zod";

export const roles = ["admin", "doctor", "patient"] as const;
export const RoleSchema = z.enum(roles);
export type Role = z.infer<typeof RoleSchema>;

export const resources = [
  "doctor",
  "patient",
  "appointment",
  "prescription",
  "billing",
  "pharmacy",
  "user",
] as const;
export const ResourceSchema = z.enum(resources);
export type Resource = z.infer<typeof ResourceSchema>;

export const permissionsActions = [
  "create",
  "read",
  "update",
  "delete",
  "readOwn",
  "updateOwn",
  "createOwn",
  "cancelOwn",
  "updateStatus",
  "readAssigned",
  "createForOwnPatients",
  "updateForOwnPatients",
  "readOwnPrescriptions",
] as const;
export const PermissionActionSchema = z.enum(permissionsActions);
export type PermissionAction = z.infer<typeof PermissionActionSchema>;

type Permissions = Record<Role, Partial<Record<Resource, readonly PermissionAction[]>>>;

export const permissions: Permissions = {
  admin: {
    doctor: ["create", "read", "update", "delete"],
    patient: ["create", "read", "update", "delete"],
    appointment: ["create", "read", "update", "delete"],
    prescription: ["create", "read", "update", "delete"],
    billing: ["create", "read", "update", "delete"],
    pharmacy: ["create", "read", "update", "delete"],
    user: ["create", "read", "update", "delete"],
  },
  doctor: {
    doctor: ["updateOwn"],
    patient: ["readAssigned"], // Doctors can read patient info for their appointments only
    appointment: ["readAssigned", "updateStatus"], // Doctors can view appointments assigned to them + update status
    prescription: ["createForOwnPatients", "updateForOwnPatients"], // Doctors can create/update prescriptions for their own patients
    billing: [], // No access
    pharmacy: ["read"], // Doctors can view medicines (read-only)
    user: [], // No access
  },
  patient: {
    doctor: [], // No access
    patient: ["readOwn", "updateOwn"], // Patients can read/update their own info only
    appointment: ["createOwn", "cancelOwn"], // Patients can create/cancel their own appointments only
    prescription: ["readOwnPrescriptions"], // Patients can only view prescriptions written for them
    billing: ["readOwn"], // Patients can view their own bills only
    pharmacy: ["read"], // Patients can view medicines (read-only)
    user: [], // No access
  },
};

export function hasPermission(
  role: Role,
  resource: Resource,
  permission: PermissionAction
): boolean {
  const rolePermissions = permissions[role];
  if (!rolePermissions) {
    return false;
  }

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) {
    return false;
  }

  return resourcePermissions.includes(permission);
}
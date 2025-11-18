import { z } from "zod";
import { UserRole } from "../db/schemas";

export const roles = ["admin", "doctor", "patient"] as const;
export const RoleSchema = z.enum(roles);
export type Role = UserRole;

export const resources = [
  "Doctor",
  "Patient",
  "Appointment",
  "Prescription",
  "Billing",
  "Pharmacy",
  "User",
] as const;
export const ResourceSchema = z.enum(resources);
export type Resource =
  | "Doctor"
  | "Patient"
  | "Appointment"
  | "Prescription"
  | "Billing"
  | "Pharmacy"
  | "User";

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
export type PermissionAction =
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

type Permissions = Record<UserRole, Partial<Record<Resource, PermissionAction[]>>>;

export const permissions: Permissions = {
  admin: {
    Doctor: ["create", "read", "update", "delete"],
    Patient: ["create", "read", "update", "delete"],
    Appointment: ["create", "read", "update", "delete"],
    Prescription: ["create", "read", "update", "delete"],
    Billing: ["create", "read", "update", "delete"],
    Pharmacy: ["create", "read", "update", "delete"],
    User: ["create", "read", "update", "delete"],
  },
  doctor: {
    Doctor: ["updateOwn"],
    Patient: ["readAssigned"], // Doctors can read patient info for their appointments only
    Appointment: ["readAssigned", "updateStatus"], // Doctors can view appointments assigned to them + update status
    Prescription: ["createForOwnPatients", "updateForOwnPatients"], // Doctors can create/update prescriptions for their own patients
    Billing: [], // No access
    Pharmacy: ["read"], // Doctors can view medicines (read-only)
    User: [], // No access
  },
  patient: {
    Doctor: [], // No access
    Patient: ["readOwn", "updateOwn"], // Patients can read/update their own info only
    Appointment: ["createOwn", "cancelOwn"], // Patients can create/cancel their own appointments only
    Prescription: ["readOwnPrescriptions"], // Patients can only view prescriptions written for them
    Billing: ["readOwn"], // Patients can view their own bills only
    Pharmacy: ["read"], // Patients can view medicines (read-only)
    User: [], // No access
  },
};

export function checkPermissions(
  role: UserRole,
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
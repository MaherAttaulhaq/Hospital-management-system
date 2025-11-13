import { sqliteTable, integer, text, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { AdapterAccount } from "next-auth/adapters";

// ---------------- USERS ----------------
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "doctor", "patient"] }).notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ---------------- ACCOUNTS ----------------
export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccount["type"]>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

// ---------------- SESSIONS ----------------
export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

// ---------------- VERIFICATION TOKENS ----------------
export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

// ---------------- DOCTORS ----------------
export const doctors = sqliteTable("doctors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  specialization: text("specialization"),
  fees: integer("fees"),
  availability: text("availability"), // e.g., "Mon-Fri 9am-5pm"
});

// ---------------- PATIENTS ----------------
export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dob: text("dob"), // ISO string
  gender: text("gender", { enum: ["male", "female", "other"] }),
  medicalHistory: text("medical_history"),
});

// ---------------- APPOINTMENTS ----------------
export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  status: text("status", {
    enum: ["pending", "confirmed", "completed", "canceled"],
  }).default("pending"),
});

// ---------------- PRESCRIPTIONS ----------------
export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appointmentId: integer("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  medicineList: text("medicine_list"), // JSON string of medicines
  notes: text("notes"),
});

// ---------------- BILLING ----------------
export const billing = sqliteTable("billing", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  appointmentId: integer("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["unpaid", "paid"] }).default("unpaid"),
  paymentMethod: text("payment_method", {
    enum: ["cash", "card", "online"],
  }).default("cash"),
});

// ---------------- PHARMACY ----------------
export const pharmacy = sqliteTable("pharmacy", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  expiryDate: text("expiry_date"), // ISO date string
});

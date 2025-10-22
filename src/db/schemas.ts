import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

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

// ---------------- DOCTORS ----------------
export const doctors = sqliteTable("doctors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  specialization: text("specialization"),
  fees: integer("fees"),
  availability: text("availability"), // e.g., "Mon-Fri 9am-5pm"
});

// ---------------- PATIENTS ----------------
export const patients = sqliteTable("patients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  dob: text("dob"), // store as ISO string
  gender: text("gender", { enum: ["male", "female", "other"] }),
  medicalHistory: text("medical_history"),
});

// ---------------- APPOINTMENTS ----------------
export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  date: text("date").notNull(), // store as ISO string
  status: text("status", { enum: ["pending", "confirmed", "completed", "canceled"] }).default("pending"),
});

// ---------------- PRESCRIPTIONS ----------------
export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  medicineList: text("medicine_list"), // JSON string of medicines
  notes: text("notes"),
});

// ---------------- BILLING ----------------
export const billing = sqliteTable("billing", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id).notNull(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["unpaid", "paid"] }).default("unpaid"),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "online"] }).default("cash"),
});

// ---------------- PHARMACY ----------------
export const pharmacy = sqliteTable("pharmacy", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  expiryDate: text("expiry_date"), // ISO date string
});
import { z } from "zod";

export enum AppointmentStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Completed = "completed",
  Cancelled = "canceled",
}

export const appointmentSchema = z.object({
  // userId: z.number().positive({ message: 'Please select a user.' }),
  patientId: z.number().positive({ message: "Please select a patient." }),
  doctorId: z.number().positive({ message: "Please select a doctor." }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  status: z.nativeEnum(AppointmentStatus, {
    message: "Please select a status.",
  }),
});

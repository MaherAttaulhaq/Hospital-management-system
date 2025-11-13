import { z } from "zod";
export const userAppointmentSchema = z.object({
  date: z.string(),
  patientId: z.number(),
  doctorId: z.number(),
  // status : z.enum().optional(),
});

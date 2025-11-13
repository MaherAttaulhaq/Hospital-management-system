import { z } from "zod";

export const prescriptionSchema = z.object({
  // userId: z.number().positive({ message: 'Please select a user.' }),
  patientId: z.number().positive({ message: "Please select a patient." }),
  doctorId: z.number().positive({ message: "Please select a doctor." }),
  appointmentId: z
    .number()
    .positive({ message: "Please select an appointment." }),
  medicineList: z.string().min(1, { message: "Please enter a medication." }),
  notes: z.string().optional(),
});

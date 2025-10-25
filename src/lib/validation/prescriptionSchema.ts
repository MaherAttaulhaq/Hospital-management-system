import {z} from 'zod';

export const prescriptionSchema = z.object({
    appointmentId : z.int(),
    doctorId : z.int(),
    patientId : z.int(),
    medicineList : z.string(),
    notes : z.string(),
});
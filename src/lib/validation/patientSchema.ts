import {z} from 'zod';

export const patientSchema = z.object({
    userId : z.int(),
    dob : z.string(),
    gender : z.string(),
    medicalHistory : z.string(),
});
import {z} from 'zod';

export const patientSchema = z.object({
    userId : z.number().positive({ message: "Please select a user." }),
    dob : z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please enter a valid date." }),
    gender : z.enum(["male", "female", "other"], { required_error: "Please select a gender." }),
    medicalHistory : z.string().optional(),
});
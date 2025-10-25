import {z} from 'zod';

export const doctorSchema = z.object({
    userId : z.int(),
    fees : z.int(),
    availability : z.string(),
    specialization : z.string(),
});
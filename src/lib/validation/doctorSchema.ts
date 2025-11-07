import {z} from 'zod';

export const doctorSchema = z.object({
    userId : z.number().min(1,'User is required'),
    fees : z.number().min(1,'Fees is required'),
    availability : z.string().min(1,'Availability is required'),
    specialization : z.string().min(1,'Specialization is required'),
});
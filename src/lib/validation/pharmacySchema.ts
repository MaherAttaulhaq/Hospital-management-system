import {z} from 'zod';

export const patientSchema = z.object({
    name : z.string(),
    expiryDate : z.string(),
    quantity : z.int(),
    price : z.int(),
});
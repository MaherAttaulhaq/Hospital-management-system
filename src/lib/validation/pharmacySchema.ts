import {z} from 'zod';

export const pharmacySchema = z.object({
    name : z.string(),
    expiryDate : z.string(),
    quantity : z.number(),
    price : z.number(),
});
import {email, z} from 'zod';

export const userSchema = z.object({
    name : z.string(),
    email : z.string().email(),
    role : z.enum(['admin','patient','doctor']),
    password : z.string().min(6,'Password must be at least 6 characters long'),
});
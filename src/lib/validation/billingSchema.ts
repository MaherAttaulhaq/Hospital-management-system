import {z} from 'zod';

export const billingSchema = z.object({
    patientId : z.int(),
    appointmentId : z.int(),
    amount : z.int(),
    status : z.string(),
    paymentMethod : z.string(),
});
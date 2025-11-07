import { z } from 'zod';

export const pharmacySchema = z.object({
  userId: z.number().positive({ message: 'Please select a user.' }),
  name: z.string().min(1, { message: 'Please enter a name.' }),
  quantity: z.number().positive({ message: 'Please enter a valid quantity.' }),
  price: z.number().positive({ message: 'Please enter a valid price.' }),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date.',
  }),
});

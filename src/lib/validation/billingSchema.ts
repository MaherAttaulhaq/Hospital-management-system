import { z } from 'zod';

export const billingSchema = z.object({
  // userId: z.number().positive({ message: 'Please select a user.' }),
  patientId: z.number().positive({ message: 'Please select a patient.' }),
  appointmentId: z.number().positive({ message: 'Please select an appointment.' }),
  amount: z.number().positive({ message: 'Please enter a valid amount.' }),
  status: z.enum(['paid', 'unpaid'], {
    message: 'Please select a status.',
  }),
  paymentMethod: z.enum(['cash', 'card', 'insurance'], {
    message: 'Please select a payment method.',
  }),
});

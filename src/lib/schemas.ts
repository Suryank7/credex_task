import { z } from 'zod';

/** Schema for a single tool entry in the audit form */
export const toolInputSchema = z.object({
  tool: z.string().min(1, 'Select a tool'),
  plan: z.string().min(1, 'Select a plan'),
  monthlySpend: z
    .number({ error: 'Enter a valid amount' })
    .min(0, 'Spend cannot be negative')
    .max(1_000_000, 'Please enter a realistic amount'),
  seats: z
    .number({ error: 'Enter a valid number' })
    .int('Seats must be a whole number')
    .min(1, 'At least 1 seat required')
    .max(100_000, 'Please enter a realistic number'),
});

/** Schema for the complete audit form */
export const auditFormSchema = z.object({
  teamSize: z
    .number({ error: 'Enter your team size' })
    .int('Team size must be a whole number')
    .min(1, 'At least 1 team member')
    .max(100_000, 'Please enter a realistic number'),
  useCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed'], {
    error: 'Select a primary use case',
  }),
  tools: z
    .array(toolInputSchema)
    .min(1, 'Add at least one tool to audit')
    .max(20, 'Maximum 20 tools per audit'),
});

/** Schema for the email gate form */
export const emailGateSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  companyName: z.string().optional(),
  role: z.string().optional(),
  honeypot: z.string().max(0, 'Bot detected'), // Must be empty
});

export type ToolInputFormData = z.infer<typeof toolInputSchema>;
export type AuditFormData = z.infer<typeof auditFormSchema>;
export type EmailGateFormData = z.infer<typeof emailGateSchema>;

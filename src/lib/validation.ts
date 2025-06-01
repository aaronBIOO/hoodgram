import * as z from "zod";

// This is a placeholder Zod schema. We will define the actual validation rules later.
export const SignupValidation = z.object({
  // Temporarily allow any string to prevent errors.
  // We will add proper validation rules (min/max length, email format, etc.) here.
  name: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
});
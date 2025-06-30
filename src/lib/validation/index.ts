import * as z from "zod";

// ============================================================
// USER
// ============================================================

// Signup Validation
export const SignupValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});


// Signin Validation
export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});


// Profile Validation
export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string(),
});


// Complete Profile Validation
export const CompleteProfileValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must be less than 50 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(20, { message: "Username must be less than 20 characters." }).regex(/^[a-z0-9_.]+$/, "Username can only contain lowercase letters, numbers, underscores, and periods."),
  // We'll add optional fields like profile_picture, bio, interests later in Phase 3
});


// ============================================================
// POST
// ============================================================
export const PostValidation = z.object({
  caption: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 caracters" }),
  file: z.custom<File[]>(),
  location: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
  tags: z.string(),
});









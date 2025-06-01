"use client"; 

import * as z from "zod"; // For defining validation schemas
import { useForm } from "react-hook-form"; // For managing form state and validation
import Link from "next/link"; // Next.js Link component for client-side navigation
import Image from "next/image"; // Import the Image component for optimized images
import { useRouter } from "next/navigation"; // Next.js router hook for programmatic navigation
import { zodResolver } from "@hookform/resolvers/zod"; // Resolver to connect Zod with React Hook Form

// Shadcn UI components (ensure these are correctly installed and set up in your project)
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // For displaying toast notifications

// Custom components and hooks (we will create placeholders for these next)
import Loader from "@/components/shared/Loader"; // Placeholder for a loading spinner component
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries"; // Placeholders for Supabase API calls
import { SignupValidation } from "@/lib/validation"; // Placeholder for Zod validation schema
import { useUserContext } from "@/context/AuthContext"; // Placeholder for authentication context

// The main SignUpPage component
export default function SignUpPage() {
  // Initialize toast notifications
  const router = useRouter(); // Initialize Next.js router for navigation
  // Placeholder for user context. We'll set this up for Supabase later.
  // For now, let's assume it provides a checkAuthUser function and a loading state.
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  // 1. Define your form using useForm from react-hook-form.
  // It uses the SignupValidation schema (which we'll define) to infer types and validate.
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation), // Connects Zod schema to React Hook Form
    defaultValues: { // Initial values for form fields
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // 2. Query hooks for Supabase API calls (these are placeholders for now)
  // We'll replace these with actual Supabase integration later.
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningInUser } = useSignInAccount();

  // 3. Define the form submission handler
  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try {
      // Attempt to create a new user account via your backend logic (Supabase)
      const newUser = await createUserAccount(user);

      if (!newUser) {
        toast("Sign up failed. Please try again.");
        return;
      }

      // If user creation is successful, attempt to sign them in
      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });

      if (!session) {
        toast("Something went wrong. Please login your new account");
        router.push("/sign-in"); // Navigate to sign-in page on failure
        return;
      }

      // If sign-in is successful, check the authenticated user status
      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset(); // Reset form fields on successful login
        router.push("/"); // Navigate to home page
      } else {
        toast("Login failed. Please try again.");
        return;
      }
    } catch (error) {
      console.log({ error }); // Log any unexpected errors
    }
  };

  return (
    // 4. The main form structure using Shadcn UI Form component
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        {/* Using Next.js Image component for optimization */}
        <Image src="/assets/images/logo.svg" alt="logo" width={100} height={100} /> {/* Added width/height for next/image */}

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Create a new account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          To use our app, please enter your details
        </p>

        {/* The actual HTML form wrapped by react-hook-form's handleSubmit */}
        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-5 w-full mt-4">

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage /> {/* Displays validation errors */}
              </FormItem>
            )}
          />

          {/* Username Field */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button with Loading State */}
          <Button type="submit" className="shad-button_primary">
            {isCreatingAccount || isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>

          {/* Link to Login Page */}
          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?
            <Link
              href="/sign-in" // Changed 'to' to 'href' for Next.js Link
              className="text-primary-500 text-small-semibold ml-1">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
}
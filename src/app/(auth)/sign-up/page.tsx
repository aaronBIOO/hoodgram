"use client"; 

import * as z from "zod"; 
import { useForm } from "react-hook-form"; 
import Link from "next/link"; 
import Image from "next/image"; 
import { useRouter } from "next/navigation"; 
import { zodResolver } from "@hookform/resolvers/zod";

// Shadcn UI components 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 

// Custom components and hooks 
import Loader from "@/components/shared/Loader"; 
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries"; 
import { SignupValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";

// The main SignUpPage component
export default function SignUpPage() {
  
  const router = useRouter(); 
  
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation), 
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // Query hooks for Supabase API calls 
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningInUser } = useSignInAccount();

  // 3. Define the form submission handler
  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    
    try {
      // Create a new user account via your backend logic (Supabase)
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
        router.push("/sign-in"); 
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
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <Image src="/assets/images/logo-1.svg" alt="logo" width={100} height={100} /> 
        <h2 className="h3-bold md:h2-bold pt-2 sm:pt-0">
          Create a new account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-0">
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
              href="/sign-in" 
              className="text-primary-500 text-small-semibold ml-1">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
}
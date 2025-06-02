"use client"; 

import * as z from "zod"; 
import { useForm } from "react-hook-form"; 
import Link from "next/link"; 
import Image from "next/image"; 
import { useRouter } from "next/navigation"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";


// Shadcn UI components 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
      email: "",
      password: "",
    },
  });

  // Query hooks for Supabase API calls 
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningInUser } = useSignInAccount();

  // 3. Define the form submission handler
  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {

    console.log("handleSignup triggered!");
    
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

  const handleGoogleSignIn = async () => {
    try {
      const session = await signIn("google", {
        callbackUrl: "/",
      });

      if (!session) {
        toast("Something went wrong. Please try again.");
        return;
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col"> {/* Original wrapper div */}
        <Image src="/assets/images/logo-1.svg" alt="logo" width={70} height={70} />
        <h2 className="h3-bold md:h2-bold pt-2 sm:pt-4"> {/* Original h2 styling */}
          Welcome to Hoodgram {/* Updated text as per Figma */}
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2"> {/* Original p styling */}
          Already have an account?
          <Link
            href="/sign-in"
            className="text-primary-500 text-small-semibold ml-1">
            Login 
          </Link>
        </p>

        {/* --- Google Sign-in Button  --- */}
        <Button
          variant="default" 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 mt-6 h-14 shad-button_primary text-base"
        >
          {/* Ensure your Google icon is at this path, or remove img if not using */}
          <Image src="/assets/images/google-logo-3.svg" alt="Google icon" width={20} height={20} />
          Sign up with Google
        </Button>

        {/* --- OR Separator  --- */}
        <div className="relative flex justify-center items-center w-full my-4">
          <Separator className="flex-grow opacity-30 max-w-[44%]" />
          <span className="flex-shrink mx-4 font-medium">Or</span> 
          <Separator className="flex-grow opacity-30 max-w-[44%]" />
        </div>
      
        {/* Only Email and Password fields remain here for progressive disclosure */}
        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-5 w-full mt-4">

          {/* Email */}
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

          {/* Password */}
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

          {/* Submit Button */}
          <Button type="submit" className="shad-button_primary mx-auto w-sm mt-2"> 
          {void console.log("Loader condition values:", { isCreatingAccount, isSigningInUser, isUserLoading })}
            {isCreatingAccount || isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up" 
            )}
          </Button>
        </form>
      </div>
    </Form>
  );
}
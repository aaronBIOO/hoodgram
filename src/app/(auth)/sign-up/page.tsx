"use client"; 

import * as z from "zod"; 
import { useForm } from "react-hook-form"; 
import { useState } from "react";
import Link from "next/link"; 
import Image from "next/image"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Shadcn UI components 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react'; 
 
// Custom components and hooks 
import Loader from "@/components/shared/Loader"; 
import { useCreateUserAccount } from "@/lib/react-query/queries"; 
import { SignupValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";

// The main SignUpPage component
export default function SignUpPage() {
  const { isLoading: isUserLoading } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation), 
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Query hooks for API calls 
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();

  // Form submission handler 
  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try { 
      await createUserAccount(user);
      toast.success("Account created! Please check your email to confirm your account.");
      
      // Reset the form and redirect to check-email page 
      router.push(`/check-email?email=${encodeURIComponent(user.email)}`);
      form.reset(); 

    } catch (error: unknown) { 
      console.error("Error during email/password sign up:", error);
      let errorMessage = "An unexpected error occurred during sign up. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
      form.setError("root", { message: errorMessage }); 
    }
  };

 // Google sign-in handler 
 const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/",
      });

    } catch (error: unknown) { 
      console.error("Error initiating Google sign in:", error);
      let errorMessage = "Failed to initiate Google sign-in. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
    }
  };

  const isFormSubmitting = isCreatingAccount || isUserLoading;

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col"> 
        <Image src="/assets/images/logo-1.svg" alt="logo" width={70} height={70} />
        <h2 className="h3-bold md:h2-bold pt-2 sm:pt-4"> 
          Welcome to Hoodgram 
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
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
          className="w-full flex items-center justify-center gap-2 mt-6 h-14 
                     shad-button_primary text-base hover:bg-primary-600
                     cursor-pointer
                     "
          disabled={isFormSubmitting}
        >
          <Image src="/assets/images/google-logo-3.svg" alt="Google icon" width={20} height={20} />
          Sign up with Google
        </Button>

        {/* --- OR Separator  --- */}
        <div className="relative flex justify-center items-center w-full mt-6 my-4">
          <Separator className="flex-grow opacity-20 max-w-[44%]" />
          <span className="flex-shrink mx-4 font-medium">Or</span> 
          <Separator className="flex-grow opacity-20 max-w-[44%]" />
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
                  <div className="relative h-14"> 
                    <Input
                      type={showPassword ? "text" : "password"} 
                      className="shad-input pr-12" 
                      {...field}
                      disabled={isFormSubmitting}
                    />
                    <Button
                      type="button" 
                      variant="ghost" 
                      className="absolute top-1/2 -translate-y-1/2 
                                 right-3 h-10 w-10 p-0 rounded-md
                                 flex items-center justify-center
                                 hover:bg-gray-700/20
                                 transition-colors duration-150
                                 mt-[-4px]
                                 " 
                      onClick={() => setShowPassword((prev) => !prev)} 
                      disabled={isFormSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-9 w-9 text-gray-500" />
                      ) : (
                        <Eye className="h-9 w-9 text-gray-500" />
                      )}
                    </Button>
                  </div> 
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" 
          className="shad-button_primary mx-auto w-sm mt-2 hover:bg-primary-600 cursor-pointer"
          disabled={isFormSubmitting}
          > 
            {isFormSubmitting ? (
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
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react"; 
import { useRouter } from "next/navigation";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Shadcn UI components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Custom components and hooks
import Loader from "@/components/shared/Loader";
import { useUpdateUserProfile } from "@/lib/react-query/queries";
import { CompleteProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user } = useUserContext();

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const form = useForm<z.infer<typeof CompleteProfileValidation>>({
    resolver: zodResolver(CompleteProfileValidation),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
    },
  });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateUserProfile();

  const handleProfileCompletion = async (values: z.infer<typeof CompleteProfileValidation>) => {
    if (!user?.id) {
      toast.error("User not authenticated. Please sign in again.");
      router.replace("/sign-in");
      return;
    }

    setIsSubmittingForm(true);

    try {
      const updated = await updateProfile({
        userId: user.id,
        name: values.name,
        username: values.username,
      });

      if (updated.success) {
        toast.success("Profile updated successfully!");
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      let errorMessage = "An unexpected error occurred while updating profile.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
      form.setError("root", { message: errorMessage });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col min-h-screen py-8">
        <Image src="/assets/images/logo-1.svg" alt="logo" width={70} height={70} className="mb-4" />
        <h2 className="h3-bold md:h2-bold pt-2 sm:pt-4 text-center">Complete Your Profile</h2>
        <p className="text-light-3 small-medium md:base-regular mt-2 mb-6 text-center">
          Just a few more details to get you started!
        </p>

        <form onSubmit={form.handleSubmit(handleProfileCompletion)} className="flex flex-col gap-5 w-full max-w-sm">

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Your Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} disabled={isSubmittingForm || isUpdatingProfile} />
                </FormControl>
                <FormMessage />
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
                  <Input type="text" className="shad-input" {...field} placeholder="@" disabled={isSubmittingForm || isUpdatingProfile} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="shad-button_primary mx-auto w-full mt-4 hover:bg-primary-600 cursor-pointer"
            disabled={isSubmittingForm || isUpdatingProfile}
          >
            {(isSubmittingForm || isUpdatingProfile) ? (
              <div className="flex-center gap-2">
                <Loader /> Saving...
              </div>
            ) : (
              "Save Profile"
            )}
          </Button>

          {/* Root form error message */}
          {form.formState.errors.root && (
            <p className="text-red-500 text-sm mt-2 text-center">{form.formState.errors.root.message}</p>
          )}

        </form>
      </div>
    </Form>
  );
}
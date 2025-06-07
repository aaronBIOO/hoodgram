"use client";

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export default function CheckEmailPage() {
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false); 

  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setUserEmail(email);
    }
  }, [searchParams]);

  // Function to open user's email provider in the browser
  const handleOpenEmailClient = () => {
    if (!userEmail) {
      toast.error("Unable to find your email. Please check your inbox manually.");
      return;
    }

    const domain = userEmail.split("@")[1]?.toLowerCase();

    // Map of popular email providers to their webmail URLs
    const emailProviders: Record<string, string> = {
      "gmail.com": "https://mail.google.com",
      "outlook.com": "https://outlook.live.com",
      "hotmail.com": "https://outlook.live.com",
      "yahoo.com": "https://mail.yahoo.com",
      "icloud.com": "https://www.icloud.com/mail",
      "aol.com": "https://mail.aol.com",
    };

    const providerURL = emailProviders[domain || ""];

    if (providerURL) {
      window.open(providerURL, "_blank"); // Open in a new tab
    } else {
      toast.info("We couldn't detect your email provider. Please check your inbox manually.");
      window.location.href = `mailto:${userEmail}`;
    }
  };

  // Function to resend the confirmation email
  const handleResendEmail = async () => {
    if (!userEmail) {
      toast.error("Cannot resend: Email address is missing.");
      return;
    }

    setIsResending(true); 
    try {
      // Use Supabase's auth.resend() method for email verification type
      const { error } = await supabase.auth.resend({
        type: 'signup', // Specify the type of email to resend
        email: userEmail,
      });

      if (error) {
        console.error("Error resending email:", error);
        toast.error(`Failed to resend email: ${error.message}`);
      } else {
        toast.success("Confirmation email sent again! Check your inbox (and spam).");
      }
    } catch (err) {
      console.error("Unexpected error resending email:", err);
      toast.error("An unexpected error occurred while trying to resend.");
    } finally {
      setIsResending(false); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-dark-1 text-light-1">
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/assets/images/logo-1.svg"
          alt="Hoodgram Icon"
          width={80}
          height={80}
          className="mb-10"
        />

        <button
          onClick={handleOpenEmailClient}
          className="bg-primary-500 text-light-1 rounded-lg py-4 px-10 text-lg font-semibold shadow-lg transition-all duration-200
                     hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75
                     w-full max-w-sm"
        >
          Check your email for confirmation
        </button>

        {/* Smaller text for spam reminder */}
        <p className="small-medium text-light-4 mt-6">
          Confirmation email could be in your spam folder.
        </p>

        {/* Resend email button */}
        <button
          onClick={handleResendEmail}
          disabled={isResending} // Disable button while resending
          className={`mt-4 text-sm text-primary-500 hover:underline
                     ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isResending ? "Resending..." : "Resend confirmation email"}
        </button>
      </div>
    </div>
  );
}

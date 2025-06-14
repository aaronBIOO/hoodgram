import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from '@supabase/supabase-js';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      // --- START: Critical Debugging Logs for signIn callback ---
      console.log('--- Supabase Client Init Debugging (signIn) ---');
      console.log('URL for client:', supabaseUrl);
      // Log only the first 10 characters of the key for security, then '...'
      console.log('Service Key (first 10 chars):', supabaseServiceKey?.substring(0, 10) + '...');
      console.log('Is URL present (boolean)?', !!supabaseUrl);
      console.log('Is Service Key present (boolean)?', !!supabaseServiceKey);
      // --- END: Critical Debugging Logs ---

      // This check will now give a clear error in your logs if keys are missing
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('FATAL ERROR: Supabase URL or Service Key is missing in signIn callback!');
        return false; // Prevent sign-in if essential keys are not found
      }

      const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

      // ... (rest of your existing console.logs for user/account, keep them)
      console.log("NextAuth signIn callback triggered.");
      console.log("User object from NextAuth:", user);
      console.log("Account object from NextAuth:", account);

      if (account?.provider === "google") {
        console.log("Processing Google sign-in...");
        console.log("User ID from NextAuth (for profile table):", user.id);

        const { data: existingProfile, error: fetchError } = await supabaseServer
          .from("profiles")
          .select("user_id")
          .eq("email", user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error fetching existing profile from supabaseServer:", fetchError);
          return false;
        }

        if (!existingProfile) {
          console.log(`Attempting to create new profile for Google user: ${user.email}`);
          const { error: insertError } = await supabaseServer.from("profiles").insert({
            user_id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });

          if (insertError) {
            console.error("Error creating new profile during sign-in using supabaseServer:", insertError);
            return false;
          }
          console.log(`New user profile successfully created for: ${user.email}`);
        } else {
          console.log(`Existing Google user signed in: ${user.email}`);
        }
      }

      return true;
    },

    async session({ session, user }) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // --- START: Critical Debugging Logs for session callback ---
        console.log('--- Supabase Client Init Debugging (session) ---');
        console.log('URL for session client:', supabaseUrl);
        console.log('Service Key (first 10 chars) for session:', supabaseServiceKey?.substring(0, 10) + '...');
        console.log('Is URL present (boolean) for session?', !!supabaseUrl);
        console.log('Is Service Key present (boolean) for session?', !!supabaseServiceKey);
        // --- END: Critical Debugging Logs ---

        // This check provides robustness
        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('FATAL ERROR: Supabase URL or Service Key is missing in session callback!');
            return session; // Still return session, but error indicates a problem
        }

        const supabaseServer = createClient(
          supabaseUrl,
          supabaseServiceKey
        );

        const { data, error } = await supabaseServer
            .from("profiles")
            .select("user_id")
            .eq("email", user.email)
            .single();

        if (error) {
            console.error("Error fetching user_id for session:", error);
        } else if (data) {
            session.user.supabaseUserId = data.user_id;
        }
        return session;
    },
  },
});

export { handler as GET, handler as POST };
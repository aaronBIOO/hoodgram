import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase/client";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("email", user.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error("Error fetching existing profile:", fetchError);
          return false;
        }

        if (!existingProfile) {
          console.log(`Creating new profile for Google user: ${user.email}`);
          const { error: insertError } = await supabase.from("profiles").insert({
            user_id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          });

          if (insertError) {
            console.error("Error creating new profile:", insertError);
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
        const { data, error } = await supabase
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

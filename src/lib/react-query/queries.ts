import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client'; 

interface UserPlaceholder {
  email: string;
  password?: string; 
}

interface CredentialsPlaceholder {
  email: string;
  password: string;
}

interface UserProfileUpdateParams { 
  userId: string;
  name: string;
  username: string;
}

// Function to create a user account with Supabase
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: async (user: UserPlaceholder) => {
      console.log("Attempting to sign up user:", user.email); // NEW LOG
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password!, 
      });

      if (error) {
        console.error("Supabase signUp error details:", error); // NEW CRUCIAL LOG
        throw new Error(error.message || "An unknown error occurred during sign up."); 
      }

      return data.user; 
    },
  });
};

// Function to sign in a user account with Supabase
export const useSignInAccount = () => {
  return useMutation({
    mutationFn: async (credentials: CredentialsPlaceholder) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message); 
      }

      if (data.session) {
        return data.session;
      } else {
        throw new Error("Login failed: No session returned.");
      }
    },
  });
};

export const useUpdateUserProfile = () => { 
  const queryClient = useQueryClient(); 

  return useMutation({
    mutationFn: async ({ userId, name, username }: UserProfileUpdateParams) => {
      console.log(`Attempting to update profile for user ID: ${userId}, username: ${username}`);

      const { data, error } = await supabase
        .from('profiles')
        .update({ name, username, updated_at: new Date().toISOString() }) 
        .eq('user_id', userId) 
        .select() 
        .single(); 

      if (error) {
        console.error("Error updating user profile:", error);
        throw new Error(error.message || "Failed to update profile.");
      }

      console.log("User profile updated successfully:", data);
      return { success: true, profile: data }; // Return success status and the updated profile data
    },
    onSuccess: (data, variables) => {
      // Invalidate queries that might be affected by the profile update.
      // This tells React Query to refetch 'user' or specific user profiles.
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] }); 
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Invalidate any general 'user' queries
      console.log("Profile update mutation successful.", data);
    },
    onError: (error) => {
      console.error("Profile update mutation failed:", error);
      // The component (CompleteProfilePage) will handle displaying this error via toast/form.setError
    },
  });
};
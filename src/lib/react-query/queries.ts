import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client'; 

interface UserPlaceholder {
  email: string;
  password?: string; 
}

interface CredentialsPlaceholder {
  email: string;
  password: string;
}

// Function to create a user account with Supabase
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: async (user: UserPlaceholder) => {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password!, 
      });

      if (error) {
        throw new Error(error.message); 
      }
      if (data.user) {
        return data.user; 
      } else {
        throw new Error("User created but no session returned, please check email for verification.");
      }
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
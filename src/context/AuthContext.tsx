"use client"; 

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 

// Define a placeholder type for your user. This will be more detailed with Supabase later.
interface IUser {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

// Define the shape of your authentication context.
// This will contain the current user, loading states, and functions to check auth status.
interface IContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuthUser: () => Promise<boolean>; // Function to verify user's authentication status
  // Add other auth related states/functions here later
}

// Create the context with default (empty) values.
// The default values are what consumers get if they don't have a Provider above them.
export const AuthContext = createContext<IContextType>({
  user: null,
  isLoading: false, // Initially, we're not checking auth status
  isAuthenticated: false,
  checkAuthUser: async () => false, // Placeholder function
});

// The AuthProvider component will wrap parts of your application that need access to auth context.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Manages loading state for auth checks
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks if a user is authenticated

  const router = useRouter(); // Initialize router for potential redirects

  // This function will eventually check if a user is logged in via Supabase.
  const checkAuthUser = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate an async check
      await new Promise(resolve => setTimeout(resolve, 300));
      // For now, let's assume no user is logged in
      const currentUser = null; // This will come from Supabase in the future

      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        return true;
      }
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // We'll add an useEffect here later to run checkAuthUser on component mount.
  // For now, let's keep it simple to avoid initial errors.
  
  useEffect(() => {
    // Check if user is logged in on component mount or page refresh
    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      router.push("/sign-in");
    }

    checkAuthUser();
  }, []);

  // The value provided to consumers of this context.
  const value = {
    user,
    isLoading,
    isAuthenticated,
    checkAuthUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily consume the AuthContext.
export const useUserContext = () => useContext(AuthContext);
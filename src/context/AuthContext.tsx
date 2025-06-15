"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react'; 
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { supabase } from "@/lib/supabase/client";

interface IUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  username?: string | null;
  supabaseUserId?: string;
}

interface IContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuthUser: () => Promise<boolean>;
}

export const AuthContext = createContext<IContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  checkAuthUser: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const guestPaths = ["/sign-in", "/sign-up", "/check-email", "/api/auth/error"];
  const profileCompletionPath = "/complete-profile";

  // Memoize checkAuthUser to prevent unnecessary re-renders in useEffect
  const checkAuthUser = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (status === "loading") {
        return false;
      }

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("user_id, username, name, email, image")
          .eq("user_id", session.user.id) // This 'id' needs next-auth.d.ts fix
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching user profile:", error);
          setUser(null);
          setIsAuthenticated(false);
          return false;
        }

        if (profile) {
          const authenticatedUser: IUser = {
            id: session.user.id, // This 'id' needs next-auth.d.ts fix
            email: session.user.email || '',
            name: profile.name || session.user.name,
            image: profile.image || session.user.image,
            username: profile.username,
            supabaseUserId: profile.user_id,
          };
          setUser(authenticatedUser);
          setIsAuthenticated(true);

          if (!profile.username && pathname !== profileCompletionPath) {
            router.replace(profileCompletionPath);
          }
          return true;
        } else {
          console.log("Authenticated user, but no matching profile found.");
          setUser({
            id: session.user.id, // This 'id' needs next-auth.d.ts fix
            email: session.user.email || '',
            name: session.user.name,
            image: session.user.image,
            username: null,
            supabaseUserId: session.user.id, // This 'id' needs next-auth.d.ts fix
          });
          setIsAuthenticated(true);

          if (pathname !== profileCompletionPath) {
            router.replace(profileCompletionPath);
          }
          return true;
        }

      } else {
        setUser(null);
        setIsAuthenticated(false);
        if (!guestPaths.includes(pathname) && status === "unauthenticated") {
          router.replace("/sign-in");
        }
        return false;
      }
    } catch (error) {
      console.error("Error in checkAuthUser:", error);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, status, pathname, router, guestPaths, profileCompletionPath, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Run checkAuthUser when its dependencies change
  useEffect(() => {
    checkAuthUser();
  }, [checkAuthUser]); // Now depends only on the memoized function

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

export const useUserContext = () => useContext(AuthContext);
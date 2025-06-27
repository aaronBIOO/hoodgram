"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
 

import { Session } from '@supabase/supabase-js';
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
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const guestPaths = ["/sign-in", "/sign-up", "/check-email", "/api/auth/error"];
  const profileCompletionPath = "/complete-profile";

  const handleAuthEvent = useCallback(async (event: string, session: Session | null) => {
    console.log("AuthContext: onAuthStateChange event:", event, "session:", session); 

    if (event === 'SIGNED_IN' && session) {
      setIsLoading(true); 
      console.log("AuthContext: SIGNED_IN event detected. Session user ID:", session.user?.id);

      try {
        const supabaseUserId = session.user?.id; 

        if (!supabaseUserId) {
          console.error("AuthContext: SIGNED_IN event with no user ID in session. Cannot process.");
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return; 
        }

        // Fetch profile from your 'profiles' table using the Supabase user ID
        const { data: profile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("user_id, username, name, email, image") // CORRECT: 'username' is included
          .eq("user_id", supabaseUserId) 
          .single();

        console.log("AuthContext: Profile fetch result after SIGNED_IN:", { profile, profileFetchError });

        if (profileFetchError && profileFetchError.code !== 'PGRST116') {
          console.error("Error fetching user profile after SIGNED_IN event:", profileFetchError);
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return; 
        }

        if (!profile || profile.username === null) { 
          console.log("AuthContext: Profile is new or incomplete (username is null). Redirecting to complete profile."); 
          
          setUser({
            id: supabaseUserId,
            email: (profile?.email || session.user.email) || '', 
            name: (profile?.name || (session.user.user_metadata?.full_name as (string | null)) || null),
            image: (profile?.image || (session.user.user_metadata?.avatar_url as (string | null)) || null),
            username: profile?.username || null, 
            supabaseUserId: supabaseUserId,
          });
          setIsAuthenticated(true);

          if (pathname !== profileCompletionPath) {
            router.replace(profileCompletionPath);
          }

        } else { 
          console.log("AuthContext: Full profile found. User is authenticated and complete.");
          const authenticatedUser: IUser = {
            id: supabaseUserId,
            email: profile.email || session.user.email || '',
            name: profile.name || (session.user.user_metadata?.full_name as (string | null)) || null,
            image: profile.image || (session.user.user_metadata?.avatar_url as (string | null)) || null,
            username: profile.username,
            supabaseUserId: profile.user_id,
          };
          setUser(authenticatedUser);
          setIsAuthenticated(true);
          
          // If on /complete-profile but profile is complete, redirect to homepage
          if (pathname === profileCompletionPath) {
            router.replace("/");
          }
        }    
      } catch (error: unknown) {
        console.error("AuthContext: Error during SIGNED_IN event processing:", error);
        setUser(null);
        setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
          console.log("AuthContext: SIGNED_IN event processed. isLoading:", false);
          }
    } else if (event === 'SIGNED_OUT') {
      console.log("AuthContext: SIGNED_OUT event detected. Clearing user state.");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      if (!guestPaths.includes(pathname)) {
        router.replace("/sign-in");
      }
    } else if (event === 'INITIAL_SESSION') {
      console.log("AuthContext: INITIAL_SESSION event. Checking for active session.");
      if (!session) {
        console.log("AuthContext: INITIAL_SESSION: No session found. User is unauthenticated.");
        setUser(null);
        setIsAuthenticated(false);
        if (!guestPaths.includes(pathname)) {
          router.replace("/sign-in");
        }
      } else {
        console.log("AuthContext: INITIAL_SESSION: Session found in storage. Awaiting explicit SIGNED_IN/SIGNED_OUT event to confirm validity.");
        setUser(null); 
        setIsAuthenticated(false); 
      }
      setIsLoading(false); 
    }
  }, [pathname, router, guestPaths, profileCompletionPath, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to auth state changes on component mount
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        handleAuthEvent(event, session);
      }, 0);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [handleAuthEvent]); 

  const value = {
    user,
    isLoading,
    isAuthenticated,
    checkAuthUser: async () => false, 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useUserContext = () => useContext(AuthContext);
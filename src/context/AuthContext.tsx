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

        // Fetch profile from 'profiles' table using the Supabase user ID
        let profile = null;
        let profileFetchError = null;
        const MAX_RETRIES = 5; // Max attempts to fetch profile
        const RETRY_DELAY_MS = 500; // Delay between retries

        for (let i = 0; i < MAX_RETRIES; i++) {
            console.log(`AuthContext: Attempt ${i + 1}/${MAX_RETRIES} to fetch profile for user ID: ${supabaseUserId}`);
            const { data, error } = await supabase
                .from("profiles")
                .select("user_id, username, name, email, image") 
                .eq("user_id", supabaseUserId) 
                .single();

            if (data) {
                profile = data;
                profileFetchError = null; // Clear any previous error
                break; // Profile found, exit loop
            } else if (error && error.code !== 'PGRST116') {
                // If it's a real error (not just "no rows found"), log and break/return
                profileFetchError = error;
                console.error(`AuthContext: Error fetching user profile on attempt ${i + 1}:`, error);
                break; // Exit on hard error
            }

            // If profile is null (PGRST116 - no rows found), or just an unexpected empty data, retry after delay
            if (i < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }

        console.log("AuthContext: Final profile fetch result after retries:", { profile, profileFetchError });

        // Handle hard errors (not PGRST116 - no rows found)
        if (profileFetchError) { 
            console.error("AuthContext: Final error fetching user profile after retries:", profileFetchError);
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
      }
    } else if (event === 'INITIAL_SESSION') {
      console.log("AuthContext: INITIAL_SESSION event. Checking for active session.");
      if (!session) {
        console.log("AuthContext: INITIAL_SESSION: No session found. User is unauthenticated.");
        setUser(null);
        setIsAuthenticated(false);
        if (!guestPaths.includes(pathname)) { 
        }
      } else {
        console.log("AuthContext: INITIAL_SESSION: Session found in storage. Awaiting explicit SIGNED_IN/SIGNED_OUT event to confirm validity.");
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
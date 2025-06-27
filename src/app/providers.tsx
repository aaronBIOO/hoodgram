"use client";

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'; 
import { AuthProvider } from '@/context/AuthContext'; 

// Initialize a new QueryClient for React Query
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children} 
        </AuthProvider>
      </QueryClientProvider>
  );
}
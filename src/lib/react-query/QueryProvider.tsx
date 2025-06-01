"use client"; 

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define the QueryProvider component
const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient instance on each render
  // This is generally recommended to prevent memory leaks in SSR environments
  const [queryClient] = useState(() => new QueryClient());

  return (
    // Provide the QueryClient to your app
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
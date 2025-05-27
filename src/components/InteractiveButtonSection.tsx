"use client";

import React, { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase'; // Our typed Supabase client!

export default function InteractiveButtonSection() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  useEffect(() => {
    async function testSupabaseConnection() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Supabase connection error:", error);
          setConnectionStatus(`Connection FAILED: ${error.message}`);
        } else {
          setConnectionStatus('Connection SUCCESS!');
          // You can log the session data to see if a user is logged in (likely null for now)
          console.log("Supabase Session Data:", session);
          // We won't display tables for this test, but the connection is confirmed.
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error("Caught an unexpected error during Supabase connection test:", e);
          setConnectionStatus(`Unexpected error: ${e.message}`);
        } else {
          console.error("Caught an unknown error:", e);
          setConnectionStatus(`An unknown error occurred.`);
        }
      }
    }

    testSupabaseConnection();
  }, []);

  const handleClick = () => {
    alert('Button clicked from Client Component!');
  };

  return (
    <div>
      <p className="mb-4 text-center">Supabase Status: {connectionStatus}</p>
      <Button onClick={handleClick}>
        Click Me (from Client Component)
      </Button>
    </div>
  );
}
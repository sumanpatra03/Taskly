import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    "https://vunmyyohwyrqoewpiedy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bm15eW9od3lycW9ld3BpZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MjM2MTUsImV4cCI6MjA1ODQ5OTYxNX0.FARUNgJOMKNkZXJ_43J9u_1yRoSnXS-xzF4pK0FqpQY"
  );

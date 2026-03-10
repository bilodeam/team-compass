import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://namgkhxmmrvqefseznou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hbWdraHhtbXJ2cWVmc2V6bm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDUwMjMsImV4cCI6MjA4ODY4MTAyM30.sRt6pFK_SCiVHGsLbjDVOF7GHDJkENq8Z004ecFfiAE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

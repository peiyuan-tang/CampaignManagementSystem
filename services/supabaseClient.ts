import { createClient } from '@supabase/supabase-js';

// These environment variables must be set in your Vercel project settings
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Key is missing. Database features will not work until configured.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
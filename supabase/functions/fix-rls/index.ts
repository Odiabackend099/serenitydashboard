import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Execute RLS fixes
    const queries = [
      // Drop existing policies
      `DROP POLICY IF EXISTS "messages_select" ON messages`,
      `DROP POLICY IF EXISTS "messages_insert" ON messages`,
      `DROP POLICY IF EXISTS "messages_update" ON messages`,
      `DROP POLICY IF EXISTS "conversations_select" ON conversations`,
      `DROP POLICY IF EXISTS "conversations_insert" ON conversations`,

      // Create permissive policies for single-tenant widget
      `CREATE POLICY "conversations_select_all" ON conversations FOR SELECT USING (true)`,
      `CREATE POLICY "conversations_insert_widget" ON conversations FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY "conversations_update_widget" ON conversations FOR UPDATE USING (true)`,

      `CREATE POLICY "messages_select_all" ON messages FOR SELECT USING (true)`,
      `CREATE POLICY "messages_insert_widget" ON messages FOR INSERT WITH CHECK (true)`,
      `CREATE POLICY "messages_update_widget" ON messages FOR UPDATE USING (true)`,

      // Enable Realtime
      `ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS conversations`,
      `ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages`,
      `ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS appointments`,
    ];

    const results = [];
    for (const query of queries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        results.push({ query, success: !error, error: error?.message });
      } catch (e: any) {
        // Some queries may fail if policies don't exist - that's ok
        results.push({ query, success: false, error: e.message, note: 'May be expected' });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in fix-rls:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

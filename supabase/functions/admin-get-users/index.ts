
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

console.log('SUPABASE_URL length:', SUPABASE_URL?.length || 0);
console.log('SUPABASE_SERVICE_ROLE_KEY length:', SUPABASE_SERVICE_ROLE_KEY?.length || 0);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    console.log('Edge function invoked: admin-get-users');
    
    // Initialize Supabase client with admin privileges
    console.log('Initializing Supabase admin client');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Verify the requesting user is authenticated and has admin privileges
    console.log('Verifying user token');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }
    
    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error(`Invalid token or user not found: ${userError}`);
    }
    
    // Check if user is admin
    console.log('Checking if user is admin');
    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin', { user_id: user.id });
    
    if (adminCheckError || !isAdmin) {
      throw new Error('User is not an admin');
    }
    
    // Fetch all users
    console.log('Fetching users data');
    const { data: { users }, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listUsersError) {
      throw new Error(`Failed to list users: ${listUsersError.message}`);
    }
    
    // Get loyalty points for each user
    console.log('Getting loyalty points for each user');
    const usersWithLoyalty = await Promise.all(users.map(async (user) => {
      const { data: pointsBalance, error: pointsError } = await supabaseAdmin.rpc(
        'get_user_points_balance',
        { user_uuid: user.id }
      );
      
      return {
        ...user,
        points_balance: pointsError ? 0 : pointsBalance
      };
    }));
    
    // Return the data with CORS headers
    console.log(`Successfully fetched ${usersWithLoyalty.length} users`);
    return new Response(
      JSON.stringify({ users: usersWithLoyalty }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while fetching users' 
      }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

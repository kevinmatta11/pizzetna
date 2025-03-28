
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Edge function invoked: admin-get-users");
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables:", {
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseServiceKey)
      });
      
      throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
    }

    console.log("Initializing Supabase admin client");
    
    // Initialize the Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user's JWT from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify that the user is an admin
    const token = authHeader.replace("Bearer ", "");
    console.log("Verifying user token");
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid token or user not found:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token", details: userError }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Checking admin status for user:", user.id);
    
    // Check if user is an admin
    const { data: isAdmin, error: isAdminError } = await supabase.rpc(
      "is_admin",
      { user_id: user.id }
    );

    if (isAdminError) {
      console.error("Error checking admin status:", isAdminError);
      return new Response(
        JSON.stringify({ error: "Error checking admin status", details: isAdminError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!isAdmin) {
      console.error("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ error: "Not authorized as admin" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Admin verification successful, fetching users");

    // Get all users from auth.users (using service role)
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error("Error fetching auth users:", authUsersError);
      throw new Error(`Error fetching auth users: ${authUsersError.message}`);
    }
    
    console.log(`Found ${authUsers.users.length} users, fetching profiles`);

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    console.log(`Found ${profiles.length} profiles, fetching points`);

    // Get all user points
    const pointsPromises = profiles.map(async (profile) => {
      const { data: points, error: pointsError } = await supabase.rpc(
        "get_user_points_balance",
        { user_uuid: profile.id }
      );
      
      if (pointsError) {
        console.error(`Error fetching points for user ${profile.id}: ${pointsError.message}`);
        return { id: profile.id, points: 0 };
      }
      
      return { id: profile.id, points };
    });
    
    const pointsResults = await Promise.all(pointsPromises);
    const pointsMap = pointsResults.reduce((acc, { id, points }) => {
      acc[id] = points;
      return acc;
    }, {});

    console.log("Building combined user data");

    // Create a map of profiles for faster lookup
    const profilesMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {});

    // Combine user data
    const combinedUsers = authUsers.users.map((authUser) => {
      const profile = profilesMap[authUser.id] || {};
      
      return {
        id: authUser.id,
        email: authUser.email || "Unknown",
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        points_balance: pointsMap[authUser.id] || 0,
        profile: profile
      };
    });

    console.log(`Returning data for ${combinedUsers.length} users`);

    return new Response(
      JSON.stringify({ users: combinedUsers }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in admin-get-users function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

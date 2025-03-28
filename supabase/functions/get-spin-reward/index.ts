
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the user has already spun today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingSpin, error: spinCheckError } = await supabaseClient
      .from('loyalty_transactions')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('transaction_type', 'wheel_spin')
      .gte('created_at', today.toISOString())
      .limit(1);

    if (spinCheckError) {
      throw spinCheckError;
    }

    if (existingSpin && existingSpin.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Already spun today",
          hasSpunToday: true
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the user has a pending spin
    const { data: pendingSpin, error: pendingError } = await supabaseClient
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('pending_spin', true)
      .limit(1);

    if (pendingError) {
      throw pendingError;
    }

    if (!pendingSpin || pendingSpin.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No pending spin available", 
          hasPendingSpin: false 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderId = pendingSpin[0].id;

    // Calculate reward based on weighted probabilities
    // "Try Again" (2 slices): 80% total
    // 50 Points: 10%
    // 100 Points: 8%
    // 300 Points: 2% (rare)
    const random = Math.random();
    let points = 0;
    let description = "Try Again";

    if (random < 0.02) {
      points = 300;
      description = "Won 300 points from Spin the Wheel";
    } else if (random < 0.10) {
      points = 100;
      description = "Won 100 points from Spin the Wheel";
    } else if (random < 0.20) {
      points = 50;
      description = "Won 50 points from Spin the Wheel";
    }

    // If the user won points, add them to their account
    if (points > 0) {
      const { data: newBalance, error: pointsError } = await supabaseClient.rpc(
        'add_loyalty_points',
        {
          user_uuid: user.id,
          points_to_add: points,
          transaction_type: 'wheel_spin',
          description: description,
          order_uuid: orderId
        }
      );

      if (pointsError) {
        throw pointsError;
      }
    } else {
      // Still log the "Try Again" spin
      const { error: logError } = await supabaseClient
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          amount: 0,
          transaction_type: 'wheel_spin',
          description: 'Try Again on Spin the Wheel',
          order_id: orderId
        });

      if (logError) {
        throw logError;
      }
    }

    // Mark the pending spin as used
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ pending_spin: false })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Return the result
    return new Response(
      JSON.stringify({ 
        points,
        description,
        success: true
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing spin reward:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

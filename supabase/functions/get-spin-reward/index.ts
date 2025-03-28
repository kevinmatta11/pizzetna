
// Follow this setup guide to integrate the Deno runtime and use TypeScript:
// https://deno.land/manual/examples/http_server

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.0'
import { corsHeaders } from '../_shared/cors.ts'

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Define the probabilities for different rewards
const REWARDS = [
  { points: 0, probability: 0.50 },    // 50% chance of getting "Try Again"
  { points: 50, probability: 0.30 },   // 30% chance of getting 50 points
  { points: 100, probability: 0.15 },  // 15% chance of getting 100 points
  { points: 300, probability: 0.05 },  // 5% chance of getting 300 points
];

// Helper function to generate a random reward based on probabilities
function calculateSpinReward(): number {
  // Generate a random value between 0 and 1
  const random = Math.random();
  let cumulativeProbability = 0;

  // Determine which reward is won based on the random value
  for (const reward of REWARDS) {
    cumulativeProbability += reward.probability;
    if (random <= cumulativeProbability) {
      return reward.points;
    }
  }

  // Fallback to 0 points (Try Again) if something goes wrong
  return 0;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get session information from the request
    const { data: { session } } = await supabase.auth.getSession();

    // If no session, return unauthorized
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Authenticated, now calculate a reward
    const points = calculateSpinReward();

    // Log the reward
    console.log(`User ${session.user.id} spun the wheel and got ${points} points`);

    // Return the calculated reward
    return new Response(
      JSON.stringify({ points }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error: ', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

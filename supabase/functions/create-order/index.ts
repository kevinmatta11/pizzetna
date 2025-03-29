
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

interface OrderRequest {
  userId?: string | null;
  totalAmount: number;
  items: {
    menuItemId: string;
    price: number;
    quantity: number;
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const { userId, totalAmount, items } = await req.json() as OrderRequest;
    
    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    console.log("Creating order with:", { userId, totalAmount, itemsCount: items.length });
    
    // Set pending_spin to true only for authenticated users
    const pending_spin = userId ? true : false;
    
    // Create the order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'paid',
        pending_spin: pending_spin
      })
      .select('id')
      .single();
    
    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(JSON.stringify({ error: orderError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    const orderId = orderData.id;
    
    // Prepare order items
    const orderItems = items.map(item => ({
      order_id: orderId,
      menu_item_id: item.menuItemId,
      price: item.price,
      quantity: item.quantity
    }));
    
    // Insert all order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return new Response(JSON.stringify({ error: itemsError }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Trigger the notification service
    try {
      const notificationResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/order-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );
      
      console.log("Notification service response:", notificationResponse.status);
      if (!notificationResponse.ok) {
        // Log the error but don't fail the order creation
        console.error("Failed to trigger notification:", await notificationResponse.text());
      }
    } catch (notificationError) {
      // Log the error but don't fail the order creation
      console.error("Error triggering notification:", notificationError);
    }
    
    return new Response(
      JSON.stringify({ success: true, orderId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

// Twilio API endpoint for sending WhatsApp messages
const TWILIO_WHATSAPP_API = "https://api.twilio.com/2010-04-01/Accounts";
// Restaurant phone number (WhatsApp-enabled)
const RESTAURANT_PHONE = "+96171104448";

interface OrderNotificationRequest {
  orderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json() as OrderNotificationRequest;
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    console.log(`Preparing notification for order: ${orderId}`);
    
    // Get basic order details first without any joins
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, pending_spin, status, user_id')
      .eq('id', orderId)
      .single();
    
    if (orderError || !orderData) {
      console.error("Error fetching order details:", orderError);
      return new Response(JSON.stringify({ error: "Failed to fetch order details" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Fetch order items in a separate query
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        quantity,
        price,
        menu_item_id,
        menu_items(name)
      `)
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return new Response(JSON.stringify({ error: "Failed to fetch order items" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
    
    // Fetch loyalty transaction data separately
    const { data: loyaltyData, error: loyaltyError } = await supabaseAdmin
      .from('loyalty_transactions')
      .select('amount, transaction_type')
      .eq('order_id', orderId);
    
    if (loyaltyError) {
      console.error("Error fetching loyalty data:", loyaltyError);
      // Continue with the process, loyalty data is non-critical
    }

    // If there's a user_id, try to fetch their address
    let addressData = null;
    if (orderData.user_id) {
      const { data: addresses, error: addressError } = await supabaseAdmin
        .from('user_addresses')
        .select('full_name, address_line1, address_line2, city, state, postal_code, phone')
        .eq('user_id', orderData.user_id)
        .eq('is_default', true)
        .limit(1);
        
      if (!addressError && addresses && addresses.length > 0) {
        addressData = addresses[0];
      } else {
        console.log("No default address found or error fetching address:", addressError);
      }
    }
    
    console.log("Order data and related information retrieved successfully");
    
    // Format order items
    const formattedItems = orderItems.map(item => {
      const itemName = item.menu_items?.name || 'Unknown item';
      return `- ${itemName} x${item.quantity}`;
    }).join('\n');
    
    // Calculate discount if any
    const loyaltyDiscount = loyaltyData
      ?.filter(t => t.transaction_type === 'redeem')
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;
    
    const discountText = loyaltyDiscount > 0 
      ? `\n🎁 Discounts Applied:\n- Loyalty Points: $${Math.abs(loyaltyDiscount).toFixed(2)}`
      : '';
    
    // Format address
    const addressText = addressData 
      ? `\n🏠 Delivery Address: ${addressData.city}, ${addressData.address_line1}${addressData.address_line2 ? ', ' + addressData.address_line2 : ''}`
      : '\n🏠 Delivery Address: Customer will pick up the order';
    
    // Compile WhatsApp message
    const whatsappMessage = `📦 NEW ORDER RECEIVED!\n\n🧾 Order #${orderData.id.substring(0, 8)}:\n${formattedItems}${discountText}\n\n💰 Total: $${orderData.total_amount.toFixed(2)}${addressText}\n\n📋 Status: ${orderData.status}\n\nPlease confirm and prepare the order.`;
    
    console.log("Formatted WhatsApp message:", whatsappMessage);
    
    // Send WhatsApp notification
    const whatsappResult = await sendWhatsAppMessage(RESTAURANT_PHONE, whatsappMessage);
    console.log("WhatsApp notification result:", whatsappResult);
    
    // Place phone call for backup alert
    const callResult = await placePhoneCall(RESTAURANT_PHONE);
    console.log("Phone call result:", callResult);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        whatsappSent: whatsappResult.success,
        callPlaced: callResult.success
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unexpected error in order notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Function to send WhatsApp message through Twilio
async function sendWhatsAppMessage(to: string, body: string) {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!accountSid || !authToken || !fromNumber) {
      console.error("Missing Twilio credentials");
      return { success: false, error: "Missing Twilio credentials" };
    }
    
    // Format to WhatsApp format if not already formatted
    const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const fromWhatsApp = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
    
    const credentials = btoa(`${accountSid}:${authToken}`);
    
    const response = await fetch(
      `${TWILIO_WHATSAPP_API}/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`
        },
        body: new URLSearchParams({
          "To": toWhatsApp,
          "From": fromWhatsApp,
          "Body": body
        })
      }
    );
    
    const result = await response.json();
    return { success: response.ok, result };
    
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { success: false, error: error.message };
  }
}

// Function to place a phone call through Twilio
async function placePhoneCall(to: string) {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!accountSid || !authToken || !fromNumber) {
      console.error("Missing Twilio credentials");
      return { success: false, error: "Missing Twilio credentials" };
    }
    
    const credentials = btoa(`${accountSid}:${authToken}`);
    
    // Twiml for a simple voice message
    const twiml = `<Response><Say>New order received. Please check your WhatsApp for details. Confirm with the customer if needed.</Say></Response>`;
    
    const response = await fetch(
      `${TWILIO_WHATSAPP_API}/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`
        },
        body: new URLSearchParams({
          "To": to,
          "From": fromNumber,
          "Twiml": twiml
        })
      }
    );
    
    const result = await response.json();
    return { success: response.ok, result };
    
  } catch (error) {
    console.error("Error placing phone call:", error);
    return { success: false, error: error.message };
  }
}

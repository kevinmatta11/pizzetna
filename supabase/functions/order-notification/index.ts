
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendWhatsAppMessage, placePhoneCall } from "../_shared/notification-utils.ts";
import { 
  fetchOrderData, 
  fetchOrderItems, 
  fetchLoyaltyData, 
  fetchAddressData 
} from "./order-data.ts";
import { formatOrderMessage } from "./message-formatter.ts";

// Restaurant phone number (WhatsApp-enabled)
const RESTAURANT_PHONE = "+96171104448";

// Define a fallback phone number for testing if the main one fails
// This should be configured in environment variables in production
const FALLBACK_PHONE = Deno.env.get("TWILIO_FALLBACK_PHONE") || RESTAURANT_PHONE;

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
    
    console.log(`Preparing notification for order: ${orderId}`);
    
    try {
      // Fetch all required data
      const orderData = await fetchOrderData(orderId);
      const orderItems = await fetchOrderItems(orderId);
      const loyaltyData = await fetchLoyaltyData(orderId);
      const addressData = await fetchAddressData(orderData.user_id);
      
      console.log("Order data and related information retrieved successfully");
      
      // Format message
      const whatsappMessage = formatOrderMessage(
        orderData, 
        orderItems, 
        loyaltyData, 
        addressData
      );
      
      console.log("Formatted WhatsApp message:", whatsappMessage);
      
      // Check if the recipient phone is the same as the Twilio phone number
      const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
      const phoneToUse = RESTAURANT_PHONE === twilioPhone ? FALLBACK_PHONE : RESTAURANT_PHONE;
      
      // Send WhatsApp notification
      const whatsappResult = await sendWhatsAppMessage(phoneToUse, whatsappMessage);
      console.log("WhatsApp notification result:", whatsappResult);
      
      let callResult = { success: false, error: "Not attempted" };
      
      // Only try to place a phone call if WhatsApp message failed or if explicitly requested
      if (!whatsappResult.success || Deno.env.get("ALWAYS_CALL") === "true") {
        // Place phone call for backup alert
        callResult = await placePhoneCall(phoneToUse);
        console.log("Phone call result:", callResult);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          whatsappSent: whatsappResult.success,
          callPlaced: callResult.success,
          message: whatsappResult.success 
            ? "Order notification sent successfully" 
            : "WhatsApp notification failed, but order was processed"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error processing order notification:", error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: "Error occurred while processing order notification"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
    
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

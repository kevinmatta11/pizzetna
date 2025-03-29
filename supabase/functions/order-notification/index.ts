
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
      
      // Format message
      const whatsappMessage = formatOrderMessage(
        orderData, 
        orderItems, 
        loyaltyData, 
        addressData
      );
      
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
      console.error("Error processing order notification:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
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

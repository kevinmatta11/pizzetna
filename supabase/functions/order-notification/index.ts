
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmailNotification } from "../_shared/notification-utils.ts";
import { 
  fetchOrderData, 
  fetchOrderItems, 
  fetchLoyaltyData, 
  fetchAddressData 
} from "./order-data.ts";
import { formatOrderMessage } from "./message-formatter.ts";

// Restaurant owner email
const RESTAURANT_EMAIL = "keevinmatta@gmail.com";

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
      const emailBody = formatOrderMessage(
        orderData, 
        orderItems, 
        loyaltyData, 
        addressData
      );
      
      console.log("Formatted email message:", emailBody);
      
      // Send email notification
      const emailSubject = `New Order #${orderData.id.substring(0, 8)} Received!`;
      const emailResult = await sendEmailNotification(
        RESTAURANT_EMAIL, 
        emailSubject, 
        emailBody
      );
      
      console.log("Email notification result:", emailResult);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent: emailResult.success,
          message: emailResult.success 
            ? "Order notification sent successfully" 
            : "Email notification failed, but order was processed"
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

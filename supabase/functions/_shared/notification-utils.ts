
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Twilio API endpoint for sending WhatsApp messages
export const TWILIO_WHATSAPP_API = "https://api.twilio.com/2010-04-01/Accounts";

// Function to send WhatsApp message through Twilio
export async function sendWhatsAppMessage(to: string, body: string) {
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
    // Make sure "from" number is different from "to" number to avoid error 63031
    const fromWhatsApp = `whatsapp:${fromNumber}`;
    
    // Check if to and from are the same, and abort if so
    if (toWhatsApp === fromWhatsApp) {
      console.error("Cannot send WhatsApp message to the same number as the sender");
      return { 
        success: false, 
        error: "Cannot send WhatsApp message to the same number as the sender. Configure a different sender number." 
      };
    }
    
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
export async function placePhoneCall(to: string) {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    if (!accountSid || !authToken || !fromNumber) {
      console.error("Missing Twilio credentials");
      return { success: false, error: "Missing Twilio credentials" };
    }
    
    // Check if international permissions are likely to be an issue
    const isInternational = !to.startsWith('+1'); // Assuming US-based account
    if (isInternational) {
      console.log("Attempting international call - this requires specific Twilio permissions");
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
    
    // If there's a geo-permissions issue, provide more specific error message
    if (!response.ok && result?.code === 21215) {
      console.error("Twilio international calling permissions required:", result.message);
      return { 
        success: false, 
        error: "International calling permissions not enabled on this Twilio account. Enable them at: https://www.twilio.com/console/voice/calls/geo-permissions/low-risk"
      };
    }
    
    return { success: response.ok, result };
    
  } catch (error) {
    console.error("Error placing phone call:", error);
    return { success: false, error: error.message };
  }
}

// Initialize Supabase client with admin privileges
export function initSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
}

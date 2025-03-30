
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Function to send email notification using Gmail SMTP via Email.js
export async function sendEmailNotification(to: string, subject: string, body: string) {
  try {
    // Email API endpoint from EmailJS service (this is a free service with CORS support)
    const apiUrl = "https://api.emailjs.com/api/v1.0/email/send";
    
    // Get necessary environment variables
    const emailjsServiceId = Deno.env.get("EMAILJS_SERVICE_ID");
    const emailjsTemplateId = Deno.env.get("EMAILJS_TEMPLATE_ID");
    const emailjsUserId = Deno.env.get("EMAILJS_USER_ID");
    
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsUserId) {
      console.error("Missing EmailJS credentials");
      return { success: false, error: "Missing EmailJS credentials" };
    }
    
    console.log("Sending email notification to:", to);
    console.log("With subject:", subject);
    console.log("Message body:", body);
    
    // Prepare the payload for EmailJS
    const data = {
      service_id: emailjsServiceId,
      template_id: emailjsTemplateId,
      user_id: emailjsUserId,
      template_params: {
        to_email: to,
        subject: subject,
        message: body,
        from_name: "Pizza Brunch Ordering System"
      }
    };
    
    // Send the email through EmailJS API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    if (response.status === 200) {
      console.log("Email sent successfully to:", to);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error("Error sending email notification. Status:", response.status, "Response:", errorText);
      return { success: false, error: `Error ${response.status}: ${errorText}` };
    }
    
  } catch (error) {
    console.error("Exception sending email notification:", error);
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


import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Resend with API key
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Define the interface for the order item
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

// Define the interface for the request body
interface NotificationRequest {
  orderId: string;
  totalAmount: number;
  userEmail: string;
  items: OrderItem[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, totalAmount, userEmail, items }: NotificationRequest = await req.json();

    console.log(`Processing order notification for Order ID: ${orderId}`);

    // Format the items for the email
    const itemsList = items.map(item => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    // Send email notification to admin
    const { data, error } = await resend.emails.send({
      from: "PizzaBrunch Orders <orders@pizzabrunch.com>",
      to: ["admin@pizzabrunch.com"], // Admin email address
      subject: `New Order #${orderId.substring(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e65100; margin-bottom: 20px;">New Order Received!</h1>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer Email:</strong> ${userEmail}</p>
          <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          
          <h2 style="color: #e65100; margin-top: 30px;">Order Items:</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0;">Please log in to the admin dashboard to manage this order.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Admin notification sent successfully:", data);

    return new Response(
      JSON.stringify({ message: "Notification sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);

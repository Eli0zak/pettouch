import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "new_order" | "subscription_upgrade";
  userId: string;
  details: {
    orderDetails?: {
      orderId: string;
      total: number;
      items: number;
    };
    subscriptionDetails?: {
      currentPlan: string;
      requestedPlan: string;
      paymentMethod: string;
      phoneNumber: string;
      transactionProofUrl?: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { type, userId, details }: NotificationRequest = await req.json();

    // Get user information
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      throw new Error("Failed to get user information");
    }

    // Store the notification in the database
    const { data: notificationData, error: notificationError } = await supabase
      .from("admin_notifications")
      .insert({
        type,
        user_id: userId,
        details: type === "new_order" ? details.orderDetails : details.subscriptionDetails,
        read: false
      });

    if (notificationError) {
      throw new Error("Failed to create notification record");
    }

    return new Response(
      JSON.stringify({ 
        message: "Notification sent successfully",
        notification_id: notificationData?.[0]?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in admin-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

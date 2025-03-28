
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definitions
export type LoyaltyTransaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  order_id: string | null;
  created_at: string;
};

// Loyalty Service APIs
export const loyaltyService = {
  // Get the user's current loyalty points balance
  async getPointsBalance(userId?: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_user_points_balance', {
        user_uuid: userId || (await supabase.auth.getUser()).data.user?.id
      });
      
      if (error) throw error;
      
      return data || 0;
    } catch (error) {
      console.error("Error fetching points balance:", error);
      return 0;
    }
  },
  
  // Get the user's loyalty transaction history
  async getTransactionHistory(): Promise<LoyaltyTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  },
  
  // Redeem points for a reward
  async redeemPoints(pointsToRedeem: number, rewardDescription: string): Promise<number> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");
      
      // Negative amount because points are being spent
      const { data, error } = await supabase.rpc(
        'add_loyalty_points',
        {
          user_uuid: user.id,
          points_to_add: -pointsToRedeem,
          transaction_type: 'redemption',
          description: rewardDescription
        }
      );
      
      if (error) throw error;
      
      return data || 0;
    } catch (error: any) {
      console.error("Error redeeming points:", error);
      throw new Error(error.message || "Failed to redeem points");
    }
  },
  
  // Add points to a user's account
  async addPoints(points: number, type: string, description?: string, orderId?: string): Promise<number> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase.rpc(
        'add_loyalty_points',
        {
          user_uuid: user.id,
          points_to_add: points,
          transaction_type: type,
          description: description || null,
          order_uuid: orderId || null
        }
      );
      
      if (error) throw error;
      
      return data || 0;
    } catch (error: any) {
      console.error("Error adding points:", error);
      throw new Error(error.message || "Failed to add points");
    }
  },
  
  // Check if the user has a pending spin from an order
  async checkPendingSpin(): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('pending_spin', true)
        .limit(1);
      
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking pending spin:", error);
      return false;
    }
  },
  
  // Mark a pending spin as used
  async markSpinUsed(orderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ pending_spin: false })
        .eq('id', orderId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error marking spin as used:", error);
      throw error;
    }
  },
  
  // Check if the user has already spun the wheel today
  async hasSpunToday(): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('transaction_type', 'wheel_spin')
        .gte('created_at', today.toISOString())
        .limit(1);
      
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking if user has spun today:", error);
      return false;
    }
  },
  
  // Calculate a spin reward on the server side with weighted probabilities
  async calculateSpinReward(): Promise<number> {
    try {
      // Use the function to get a reward value
      const { data, error } = await supabase.functions.invoke('get-spin-reward');
      
      if (error) throw error;
      
      // Return the calculated reward points
      return data?.points || 0;
    } catch (error) {
      console.error("Error calculating spin reward:", error);
      // Default to "Try Again" (0 points) in case of error
      return 0;
    }
  },
  
  // Add points from a spin
  async addPointsFromWheel(points: number): Promise<number> {
    return this.addPoints(
      points, 
      'wheel_spin', 
      points > 0 ? `Won ${points} points from Spin the Wheel` : 'Spin the Wheel - Try Again'
    );
  }
};

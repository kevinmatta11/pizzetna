
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export type TransactionType = 'earned' | 'redeemed';

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  order_id: string | null;
  created_at: string;
}

// Service
export const loyaltyService = {
  // Get current user's points balance
  async getPointsBalance(): Promise<number> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;
      
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('points_balance')
        .eq('user_id', user.user.id)
        .single();
      
      if (error) throw error;
      return data?.points_balance || 0;
    } catch (error) {
      console.error("Error fetching points balance:", error);
      return 0;
    }
  },
  
  // Get transaction history
  async getTransactionHistory(): Promise<LoyaltyTransaction[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching transaction history:", error);
        throw error;
      }

      // Cast the transaction_type to the correct type
      return data.map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as TransactionType
      }));
    } catch (error) {
      console.error("Error in getTransactionHistory:", error);
      return [];
    }
  },
  
  // Check if user has a pending spin
  async checkPendingSpin(): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;
      
      // Check if there are any orders with pending_spin = true
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('pending_spin', true)
        .limit(1);
      
      if (error) {
        console.error("Error checking pending spin:", error);
        throw error;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error in checkPendingSpin:", error);
      return false;
    }
  },
  
  // Mark spin as used
  async markSpinAsUsed(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      
      // Get the first order with pending spin
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('pending_spin', true)
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error finding order with pending spin:", error);
        return;
      }
      
      // Update the order to mark the spin as used
      const { error: updateError } = await supabase
        .from('orders')
        .update({ pending_spin: false })
        .eq('id', data.id);
      
      if (updateError) {
        console.error("Error marking spin as used:", updateError);
      }
    } catch (error) {
      console.error("Error in markSpinAsUsed:", error);
    }
  },
  
  // Add points from wheel spin
  async addPointsFromSpin(points: number): Promise<number> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase.rpc(
        'add_loyalty_points',
        {
          user_uuid: user.user.id,
          points_to_add: points,
          transaction_type: 'earned',
          description: `Wheel spin reward: ${points} points`
        }
      );
      
      if (error) throw error;
      
      toast.success(`Congratulations! You earned ${points} loyalty points!`);
      return data || 0;
    } catch (error) {
      console.error("Error adding points from spin:", error);
      toast.error("Failed to add loyalty points");
      return 0;
    }
  },
  
  // Redeem points for an order
  async redeemPoints(points: number, orderId?: string): Promise<number> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");
      
      // Negative value for redemption
      const pointsToRedeem = -Math.abs(points);
      
      const { data, error } = await supabase.rpc(
        'add_loyalty_points',
        {
          user_uuid: user.user.id,
          points_to_add: pointsToRedeem,
          transaction_type: 'redeemed',
          description: `Redeemed ${Math.abs(pointsToRedeem)} points for discount`,
          order_uuid: orderId
        }
      );
      
      if (error) throw error;
      
      toast.success(`Successfully redeemed ${Math.abs(pointsToRedeem)} points!`);
      return data || 0;
    } catch (error) {
      console.error("Error redeeming points:", error);
      toast.error("Failed to redeem loyalty points");
      return 0;
    }
  }
};

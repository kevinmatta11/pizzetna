
import { initSupabaseAdmin } from "../_shared/notification-utils.ts";

export interface OrderData {
  id: string;
  total_amount: number;
  pending_spin: boolean;
  status: string;
  user_id: string | null;
}

export interface OrderItem {
  quantity: number;
  price: number;
  menu_items: {
    name: string;
  } | null;
}

export interface LoyaltyTransaction {
  amount: number;
  transaction_type: string;
}

export interface AddressData {
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  phone: string | null;
}

export async function fetchOrderData(orderId: string) {
  const supabaseAdmin = initSupabaseAdmin();
  
  // Get basic order details first without any joins
  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, pending_spin, status, user_id')
    .eq('id', orderId)
    .single();
  
  if (orderError || !orderData) {
    console.error("Error fetching order details:", orderError);
    throw new Error("Failed to fetch order details");
  }
  
  return orderData as OrderData;
}

export async function fetchOrderItems(orderId: string) {
  const supabaseAdmin = initSupabaseAdmin();
  
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
    throw new Error("Failed to fetch order items");
  }
  
  return orderItems as OrderItem[];
}

export async function fetchLoyaltyData(orderId: string) {
  const supabaseAdmin = initSupabaseAdmin();
  
  // Fetch loyalty transaction data separately
  const { data: loyaltyData, error: loyaltyError } = await supabaseAdmin
    .from('loyalty_transactions')
    .select('amount, transaction_type')
    .eq('order_id', orderId);
  
  if (loyaltyError) {
    console.error("Error fetching loyalty data:", loyaltyError);
    // Return empty array instead of throwing - loyalty data is non-critical
    return [];
  }
  
  return loyaltyData as LoyaltyTransaction[];
}

export async function fetchAddressData(userId: string | null) {
  // If there's no user ID, we can't fetch an address
  if (!userId) return null;
  
  const supabaseAdmin = initSupabaseAdmin();
  
  const { data: addresses, error: addressError } = await supabaseAdmin
    .from('user_addresses')
    .select('full_name, address_line1, address_line2, city, state, postal_code, phone')
    .eq('user_id', userId)
    .eq('is_default', true)
    .limit(1);
    
  if (addressError) {
    console.error("Error fetching address:", addressError);
    return null;
  }
  
  return addresses.length > 0 ? addresses[0] as AddressData : null;
}

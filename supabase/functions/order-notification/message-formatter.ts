
import { OrderData, OrderItem, AddressData, LoyaltyTransaction } from "./order-data.ts";

export function formatOrderMessage(
  orderData: OrderData,
  orderItems: OrderItem[],
  loyaltyData: LoyaltyTransaction[],
  addressData: AddressData | null
): string {
  // Format order items
  const formattedItems = orderItems.map(item => {
    const itemName = item.menu_items?.name || 'Unknown item';
    return `- ${itemName} x${item.quantity} ($${item.price.toFixed(2)})`;
  }).join('\n');
  
  // Calculate discount if any
  const loyaltyDiscount = loyaltyData
    ?.filter(t => t.transaction_type === 'redeem')
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;
  
  const discountText = loyaltyDiscount > 0 
    ? `\n🎁 Discounts Applied:\n- Loyalty Points: $${Math.abs(loyaltyDiscount).toFixed(2)}`
    : '';
  
  // Format address
  const addressText = addressData 
    ? `\n🏠 Delivery Address: ${addressData.city}, ${addressData.address_line1}${addressData.address_line2 ? ', ' + addressData.address_line2 : ''}`
    : '\n🏠 Delivery Address: Customer will pick up the order';
  
  // Compile email message
  return `📦 NEW ORDER RECEIVED!\n\n🧾 Order #${orderData.id.substring(0, 8)}:\n${formattedItems}${discountText}\n\n💰 Total: $${orderData.total_amount.toFixed(2)}${addressText}\n\n📋 Status: ${orderData.status}\n\nPlease confirm and prepare the order.\n\nContact customer at: ${addressData?.phone || "No phone provided"}\nOrder placed on: ${new Date().toLocaleString()}\n\nThank you!\nYour PizzaBrunch System`;
}

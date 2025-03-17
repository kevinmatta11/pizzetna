
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";

// Define the pizza item type
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageSrc: string;
}

// Define the context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        toast({
          title: "Added to cart",
          description: `${item.name} quantity updated`,
        });
        return updatedItems;
      } else {
        // Add new item with quantity 1
        toast({
          title: "Added to cart",
          description: `${item.name} added to your order`,
        });
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeItem = (id: number) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.name} removed from your order`,
        });
      }
      return prevItems.filter(item => item.id !== id);
    });
  };

  // Update item quantity
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed",
    });
  };

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Create a hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

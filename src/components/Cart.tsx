import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { X, Minus, Plus, ShoppingCart, CreditCard, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Separator } from '@/components/ui/separator';
import { PaymentForm } from '@/components/PaymentForm';

export const Cart = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowPayment(true);
  };

  const CartTrigger = ({ children }: { children: React.ReactNode }) => (
    <Button 
      variant="outline" 
      className="relative p-2 bg-white border-brunch-200"
      onClick={() => setOpen(true)}
    >
      <ShoppingCart className="h-5 w-5 text-brunch-700" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-brunch-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
      {children}
    </Button>
  );

  const CartItems = () => (
    <div className="flex flex-col gap-4 py-4 overflow-auto max-h-[50vh]">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingCart className="h-12 w-12 text-brunch-300 mb-4" />
          <h3 className="text-lg font-medium text-brunch-700 mb-2">Your cart is empty</h3>
          <p className="text-sm text-brunch-500">Add some delicious pizzas to get started!</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2">
            <div className="h-16 w-16 rounded-md overflow-hidden bg-brunch-100 flex-shrink-0">
              <img src={item.imageSrc} alt={item.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-brunch-900 truncate">{item.name}</h4>
              <p className="text-sm font-semibold text-brunch-700">${(item.price * item.quantity).toFixed(2)}</p>
              <div className="flex items-center mt-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full border-brunch-200"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="mx-2 text-sm font-medium w-5 text-center">{item.quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-6 w-6 rounded-full border-brunch-200"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-brunch-400 hover:text-brunch-700"
              onClick={() => removeItem(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );

  const CartFooter = () => (
    <>
      {items.length > 0 && (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brunch-600">Subtotal</span>
            <span className="font-medium">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brunch-600">Delivery Fee</span>
            <span className="font-medium">$3.99</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium text-brunch-900">Total</span>
            <span className="font-bold text-brunch-900">${(totalPrice + 3.99).toFixed(2)}</span>
          </div>
        </div>
      )}
      <div className="flex flex-col space-y-2 mt-4">
        <Button 
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="bg-brunch-500 hover:bg-brunch-600 text-white"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Proceed to Payment
        </Button>
        {items.length > 0 && (
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="border-brunch-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        )}
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <CartTrigger>
            {totalItems > 0 && <span className="sr-only">Open cart ({totalItems} items)</span>}
          </CartTrigger>
        </SheetTrigger>
        <SheetContent className="w-[350px] sm:w-[450px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Your Order {totalItems > 0 && `(${totalItems})`}
            </SheetTitle>
          </SheetHeader>
          
          {!showPayment ? (
            <>
              <div className="flex-1 overflow-auto">
                <CartItems />
              </div>
              <SheetFooter className="sm:justify-start mt-auto pt-2">
                <CartFooter />
              </SheetFooter>
            </>
          ) : (
            <div className="flex-1 overflow-auto">
              <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => setShowPayment(false)}
              >
                <X className="h-4 w-4 mr-2" /> Back to cart
              </Button>
              <PaymentForm 
                totalAmount={(totalPrice + 3.99).toFixed(2)} 
                onSuccess={() => {
                  clearCart();
                  setShowPayment(false);
                  setOpen(false);
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <CartTrigger>
            {totalItems > 0 && <span className="sr-only">Open cart ({totalItems} items)</span>}
          </CartTrigger>
        </DrawerTrigger>
        <DrawerContent className="px-4">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Your Order {totalItems > 0 && `(${totalItems})`}
            </DrawerTitle>
          </DrawerHeader>
          
          {!showPayment ? (
            <>
              <div className="px-4">
                <CartItems />
              </div>
              <DrawerFooter>
                <CartFooter />
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          ) : (
            <div className="px-4 pb-8">
              <Button 
                variant="ghost" 
                className="mb-4" 
                onClick={() => setShowPayment(false)}
              >
                <X className="h-4 w-4 mr-2" /> Back to cart
              </Button>
              <PaymentForm 
                totalAmount={(totalPrice + 3.99).toFixed(2)} 
                onSuccess={() => {
                  clearCart();
                  setShowPayment(false);
                  setOpen(false);
                }}
              />
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

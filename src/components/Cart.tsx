
import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { X, Minus, Plus, ShoppingCart, CreditCard, Trash2, TruckIcon, Check } from 'lucide-react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useMediaQuery } from '@/hooks/use-media-query';
import { Separator } from '@/components/ui/separator';
import { PaymentForm } from '@/components/PaymentForm';
import { DeliveryForm, DeliveryFormData } from '@/components/DeliveryForm';
import { toast } from 'sonner';

type CheckoutStep = 'cart' | 'delivery' | 'payment' | 'confirmation';
type PaymentMethod = 'credit' | 'cash';

export const Cart = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryFormData | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCheckout = () => {
    if (items.length === 0) return;
    setCheckoutStep('delivery');
  };

  const handleDeliverySubmit = (data: DeliveryFormData) => {
    setDeliveryInfo(data);
    setCheckoutStep('payment');
  };

  const handlePaymentSuccess = () => {
    setCheckoutStep('confirmation');
    setTimeout(() => {
      clearCart();
      setOpen(false);
      setCheckoutStep('cart');
      setDeliveryInfo(null);
    }, 3000);
  };

  const handleCashPayment = () => {
    toast.success("Your order has been placed successfully!");
    handlePaymentSuccess();
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
          Proceed to Checkout
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

  const PaymentOptions = () => (
    <div className="flex flex-col space-y-6">
      <Button 
        variant="ghost" 
        className="mb-2" 
        onClick={() => setCheckoutStep('delivery')}
      >
        <X className="h-4 w-4 mr-2" /> Back to delivery
      </Button>
      
      <h3 className="text-lg font-medium">Select Payment Method</h3>
      
      <Tabs defaultValue="credit" onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="credit">Credit Card</TabsTrigger>
          <TabsTrigger value="cash">Cash on Delivery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credit">
          <PaymentForm
            totalAmount={(totalPrice + 3.99).toFixed(2)}
            onSuccess={handlePaymentSuccess}
          />
        </TabsContent>
        
        <TabsContent value="cash">
          <div className="space-y-4">
            <div className="bg-brunch-50 p-4 rounded-md">
              <h4 className="font-medium mb-2 flex items-center">
                <TruckIcon className="h-4 w-4 mr-2" />
                Cash on Delivery
              </h4>
              <p className="text-sm text-brunch-600">
                Pay with cash when your order is delivered to your doorstep.
              </p>
            </div>
            
            <div className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-brunch-600">Total Amount:</span>
                <span className="font-bold">${(totalPrice + 3.99).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-brunch-600">Delivery Address:</span>
              </div>
              <div className="bg-brunch-50 p-3 rounded text-sm">
                <p><strong>{deliveryInfo?.fullName}</strong></p>
                <p>{deliveryInfo?.address}</p>
                <p>{deliveryInfo?.city}, {deliveryInfo?.postalCode}</p>
                <p>Phone: {deliveryInfo?.phone}</p>
                {deliveryInfo?.notes && (
                  <p className="mt-2"><strong>Notes:</strong> {deliveryInfo.notes}</p>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleCashPayment}
              className="w-full bg-brunch-500 hover:bg-brunch-600 text-white"
            >
              Place Order
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const OrderConfirmation = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-medium text-brunch-900 mb-2">Order Placed Successfully!</h3>
      <p className="text-sm text-brunch-600 mb-4">Thank you for your order</p>
      {paymentMethod === 'cash' && (
        <div className="bg-brunch-50 p-3 rounded-md text-sm text-left w-full mt-4">
          <p className="font-medium">Please have the exact change ready:</p>
          <p className="font-bold text-lg">${(totalPrice + 3.99).toFixed(2)}</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (checkoutStep) {
      case 'delivery':
        return (
          <>
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => setCheckoutStep('cart')}
            >
              <X className="h-4 w-4 mr-2" /> Back to cart
            </Button>
            <h3 className="text-lg font-medium mb-4">Delivery Information</h3>
            <DeliveryForm onSubmit={handleDeliverySubmit} />
          </>
        );
      case 'payment':
        return <PaymentOptions />;
      case 'confirmation':
        return <OrderConfirmation />;
      default:
        return (
          <>
            <CartItems />
            <CartFooter />
          </>
        );
    }
  };

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
              {checkoutStep === 'cart' ? `Your Order ${totalItems > 0 ? `(${totalItems})` : ''}` : 'Checkout'}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-auto">
            {renderStepContent()}
          </div>
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
              {checkoutStep === 'cart' ? `Your Order ${totalItems > 0 ? `(${totalItems})` : ''}` : 'Checkout'}
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 pb-8">
            {renderStepContent()}
          </div>
          
          {checkoutStep === 'cart' && (
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

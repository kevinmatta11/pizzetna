import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreditCard, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  cardName: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  cardNumber: z.string()
    .min(16, { message: "Card number must be 16 digits." })
    .max(19, { message: "Card number must be valid." })
    .refine((val) => /^[0-9\s-]{16,19}$/.test(val), {
      message: "Please enter a valid card number.",
    }),
  expiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
      message: "Expiry must be in MM/YY format.",
    }),
  cvc: z.string()
    .length(3, { message: "CVC must be 3 digits." })
    .regex(/^[0-9]{3}$/, { message: "CVC must contain only numbers." }),
});

export const PaymentForm = ({ totalAmount, onSuccess }: { totalAmount: string, onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "Payment Successful",
        description: "Your order is being processed.",
      });
      
      // Wait a moment before closing
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium text-pizzetna-900 mb-2">Payment Successful!</h3>
        <p className="text-sm text-pizzetna-600 mb-4">Thank you for your order</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Payment Details</h3>
        <p className="text-sm text-muted-foreground">Complete your order by providing your payment details.</p>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="font-medium">Total Amount:</p>
        <p className="font-bold text-lg">${totalAmount}</p>
      </div>
      
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cardholder Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1234 5678 9012 3456" 
                    {...field}
                    onChange={(e) => {
                      // Format card number with spaces
                      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      if (value.length > 16) value = value.substr(0, 16);
                      const parts = [];
                      for (let i = 0; i < value.length; i += 4) {
                        parts.push(value.substr(i, 4));
                      }
                      field.onChange(parts.join(' '));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="MM/YY" 
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '');
                        if (value.length > 4) value = value.substr(0, 4);
                        if (value.length > 2) {
                          value = value.substr(0, 2) + '/' + value.substr(2);
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cvc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVC</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123" 
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        if (value.length > 3) return;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-pizzetna-500 hover:bg-pizzetna-600 text-white mt-6"
            disabled={isProcessing}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

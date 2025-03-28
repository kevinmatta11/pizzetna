
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

// Define form validation schema
const addressSchema = z.object({
  full_name: z.string().min(2, { message: 'Full name is required' }),
  address_line1: z.string().min(2, { message: 'Address is required' }),
  address_line2: z.string().optional(),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  postal_code: z.string().min(2, { message: 'Postal code is required' }),
  country: z.string().min(2, { message: 'Country is required' }).default('United States'),
  phone: z.string().optional(),
  is_default: z.boolean().default(false),
});

// Type for form values
type AddressFormValues = z.infer<typeof addressSchema>;

// Type for address
type Address = {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  user_id: string;
};

interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up form with default values
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: address?.full_name || '',
      address_line1: address?.address_line1 || '',
      address_line2: address?.address_line2 || '',
      city: address?.city || '',
      state: address?.state || '',
      postal_code: address?.postal_code || '',
      country: address?.country || 'United States',
      phone: address?.phone || '',
      is_default: address?.is_default || false,
    },
  });

  const onSubmit = async (values: AddressFormValues) => {
    if (!user) {
      toast.error('You must be logged in to save an address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (address?.id) {
        // Update existing address
        const { error } = await supabase
          .from('user_addresses')
          .update({
            full_name: values.full_name,
            address_line1: values.address_line1,
            address_line2: values.address_line2 || null,
            city: values.city,
            state: values.state,
            postal_code: values.postal_code,
            country: values.country,
            phone: values.phone || null,
            is_default: values.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq('id', address.id);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const { error } = await supabase.from('user_addresses').insert({
          user_id: user.id,
          full_name: values.full_name,
          address_line1: values.address_line1,
          address_line2: values.address_line2 || null,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code,
          country: values.country,
          phone: values.phone || null,
          is_default: values.is_default,
        });

        if (error) throw error;
        toast.success('Address saved successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address_line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address_line2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2 (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Apt 4B" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="10001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="United States" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Set as default address</FormLabel>
                <FormDescription>
                  This address will be used as the default for deliveries.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-brunch-500 hover:bg-brunch-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : address?.id ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddressForm;

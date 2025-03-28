
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import AddressCard from '@/components/AddressCard';
import AddressForm from '@/components/AddressForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
};

const AddressesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

  useEffect(() => {
    // Redirect to auth page if not logged in
    if (!user && !isLoading) {
      navigate('/auth');
    }
  }, [user, navigate, isLoading]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data as Address[]);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setCurrentAddress(null);
    setIsFormOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setCurrentAddress(address);
    setIsFormOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAddresses(addresses.filter(address => address.id !== id));
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh addresses to get updated defaults
      fetchAddresses();
      toast.success('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    fetchAddresses();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container py-8 mt-16">
        <PageHeader 
          title="Your Addresses" 
          description="Manage your delivery addresses for faster checkout" 
        />

        <div className="mt-8">
          <Button 
            onClick={handleAddAddress} 
            className="mb-6 bg-brunch-500 hover:bg-brunch-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Address
          </Button>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brunch-500" />
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => handleDeleteAddress(address.id)}
                  onSetDefault={() => handleSetDefault(address.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You don't have any saved addresses yet.</p>
              <Button 
                onClick={handleAddAddress}
                className="bg-brunch-500 hover:bg-brunch-600"
              >
                Add Your First Address
              </Button>
            </div>
          )}
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            <AddressForm 
              address={currentAddress} 
              onSuccess={handleFormSubmit} 
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default AddressesPage;

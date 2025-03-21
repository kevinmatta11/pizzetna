
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from '@/contexts/CartContext';
import { Pizza, Utensils, Clock, Flame, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_name: string;
  preparation_time: string | null;
  spicy_level: string | null;
  image_url: string | null;
};

const Menu = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("menu_items")
          .select(`
            *,
            categories:category_id (name)
          `)
          .order('name');

        if (error) throw error;
        
        const formattedMenuItems = data.map((item: any) => ({
          ...item,
          category_name: item.categories?.name || "Uncategorized"
        }));

        setMenuItems(formattedMenuItems || []);
      } catch (err: any) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items. Please try again later.");
        toast.error("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: parseInt(item.id), // Convert string to number
      name: item.name,
      price: item.price,
      imageSrc: item.image_url || "/placeholder.svg"
    });
  };

  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
        <Skeleton className="w-full h-48" />
        <div className="p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brunch-50/50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8 hover:bg-brunch-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-brunch-900 mb-4">Our Menu</h1>
          <p className="text-brunch-700 max-w-2xl mx-auto">
            Discover our selection of handcrafted pizzas made with love and the finest ingredients
          </p>
        </div>

        {error && (
          <div className="text-center p-8 bg-red-50 rounded-lg mb-8">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            renderSkeletons()
          ) : menuItems.length === 0 ? (
            <div className="col-span-full text-center p-8 bg-brunch-50 rounded-lg">
              <p className="text-brunch-700">No menu items available at the moment.</p>
              <p className="text-brunch-500 mt-2">Please check back later or contact us for today's specials!</p>
            </div>
          ) : (
            menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-brunch-900 mb-2">{item.name}</h3>
                      <p className="text-brunch-700 text-sm mb-4">{item.description || "No description available"}</p>
                    </div>
                    <span className="text-xl font-bold text-brunch-500">${parseFloat(item.price.toString()).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-brunch-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Utensils className="h-4 w-4" />
                      <span>{item.category_name}</span>
                    </div>
                    {item.preparation_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{item.preparation_time}</span>
                      </div>
                    )}
                    {item.spicy_level && (
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        <span>{item.spicy_level}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">View Details</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <div className="p-6">
                          <h2 className="text-2xl font-semibold mb-4">{item.name}</h2>
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-64 object-cover rounded-lg mb-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <p className="text-brunch-700 mb-4">{item.description || "No description available"}</p>
                          <div className="space-y-2">
                            <p><strong>Category:</strong> {item.category_name}</p>
                            {item.preparation_time && <p><strong>Preparation Time:</strong> {item.preparation_time}</p>}
                            {item.spicy_level && <p><strong>Spicy Level:</strong> {item.spicy_level}</p>}
                            <p><strong>Price:</strong> ${parseFloat(item.price.toString()).toFixed(2)}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      onClick={() => handleAddToCart(item)}
                      className="bg-brunch-500 hover:bg-brunch-600 text-white"
                    >
                      Add to Order
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;

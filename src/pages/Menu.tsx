
import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame } from 'lucide-react';
import Header from '@/components/Header';
import { Cart } from '@/components/Cart';
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  preparation_time: string;
  spicy_level: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Menu() {
  const cart = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Set active category to first one if available
        if (categoriesData && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }

        // Fetch menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*')
          .order('name');

        if (menuItemsError) throw menuItemsError;
        setMenuItems(menuItemsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addToCart = (menuItem: MenuItem) => {
    try {
      const item = {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        imageSrc: menuItem.image_url || '/placeholder.svg',
        quantity: 1 // Set default quantity
      };
      
      cart.addItem(item);
      toast.success(`Added ${menuItem.name} to cart`);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const getSpicyLevelIcon = (level: string | null) => {
    if (!level) return null;
    
    const spicyLevels: Record<string, { color: string, count: number }> = {
      'mild': { color: 'yellow', count: 1 },
      'medium': { color: 'orange', count: 2 },
      'hot': { color: 'red', count: 3 },
    };
    
    const spicyInfo = spicyLevels[level.toLowerCase()];
    if (!spicyInfo) return null;
    
    return Array(spicyInfo.count).fill(0).map((_, i) => (
      <Flame 
        key={i} 
        className={`h-4 w-4 text-${spicyInfo.color}-500`} 
        fill={`${spicyInfo.color}`}
      />
    ));
  };

  const filteredItems = activeCategory 
    ? menuItems.filter(item => item.category_id === activeCategory)
    : menuItems;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto py-16 md:py-24 px-4 flex-grow">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brunch-800">Our Menu</h1>
          <p className="text-brunch-600 mt-2">Explore our delicious selection of pizzas and more</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <Tabs 
              defaultValue={categories[0]?.id} 
              value={activeCategory || undefined}
              onValueChange={setActiveCategory}
              className="mt-8"
            >
              <TabsList className="mb-8 flex flex-wrap">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="h-48 w-full overflow-hidden bg-brunch-100">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-brunch-100 text-brunch-400">
                              No image available
                            </div>
                          )}
                        </div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">{item.name}</CardTitle>
                            <Badge variant="outline" className="font-bold text-brunch-700">
                              ${item.price.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.preparation_time && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.preparation_time}
                              </Badge>
                            )}
                            {item.spicy_level && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {getSpicyLevelIcon(item.spicy_level)}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-brunch-600">{item.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            onClick={() => addToCart(item)} 
                            className="w-full bg-brunch-500 hover:bg-brunch-600"
                          >
                            Add to Cart
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
      
      <div className="fixed bottom-4 right-4 z-50">
        <Cart />
      </div>
    </div>
  );
}

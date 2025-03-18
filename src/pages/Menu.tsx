
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from '@/contexts/CartContext';
import { Pizza, Utensils, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Menu = () => {
  const { addItem } = useCart();

  const menuItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Fresh tomatoes, mozzarella, basil",
      price: 12.99,
      category: "Classic",
      preparationTime: "20 mins",
      spicyLevel: "Mild",
      imageSrc: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      description: "Classic pepperoni and mozzarella",
      price: 14.99,
      category: "Classic",
      preparationTime: "25 mins",
      spicyLevel: "Mild",
      imageSrc: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Vegetarian Pizza",
      description: "Assorted fresh vegetables and mozzarella",
      price: 13.99,
      category: "Vegetarian",
      preparationTime: "22 mins",
      spicyLevel: "None",
      imageSrc: "/placeholder.svg"
    },
    {
      id: 4,
      name: "BBQ Chicken Pizza",
      description: "BBQ sauce, chicken, red onions, cilantro",
      price: 16.99,
      category: "Specialty",
      preparationTime: "30 mins",
      spicyLevel: "Mild",
      imageSrc: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Hawaiian Pizza",
      description: "Ham, pineapple, mozzarella",
      price: 15.99,
      category: "Specialty",
      preparationTime: "28 mins",
      spicyLevel: "None",
      imageSrc: "/placeholder.svg"
    },
    {
      id: 6,
      name: "Spicy Italian Pizza",
      description: "Spicy sausage, pepperoni, jalapeños, mozzarella",
      price: 17.99,
      category: "Spicy",
      preparationTime: "35 mins",
      spicyLevel: "Hot",
      imageSrc: "/placeholder.svg"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brunch-50/50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-brunch-900 mb-4">Our Menu</h1>
          <p className="text-brunch-700 max-w-2xl mx-auto">
            Discover our selection of handcrafted pizzas made with love and the finest ingredients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={item.imageSrc}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-brunch-900 mb-2">{item.name}</h3>
                    <p className="text-brunch-700 text-sm mb-4">{item.description}</p>
                  </div>
                  <span className="text-xl font-bold text-brunch-500">${item.price}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-brunch-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Utensils className="h-4 w-4" />
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{item.preparationTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    <span>{item.spicyLevel}</span>
                  </div>
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
                          src={item.imageSrc}
                          alt={item.name}
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                        <p className="text-brunch-700 mb-4">{item.description}</p>
                        <div className="space-y-2">
                          <p><strong>Category:</strong> {item.category}</p>
                          <p><strong>Preparation Time:</strong> {item.preparationTime}</p>
                          <p><strong>Spicy Level:</strong> {item.spicyLevel}</p>
                          <p><strong>Price:</strong> ${item.price}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    onClick={() => addItem(item)}
                    className="bg-brunch-500 hover:bg-brunch-600 text-white"
                  >
                    Add to Order
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;

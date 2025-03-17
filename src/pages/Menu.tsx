
import React, { useState } from 'react';
import { Pizza, Search, Filter, ShoppingCart, Flame } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Define pizza types
interface PizzaItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
  category: string;
  bestseller?: boolean;
  vegetarian?: boolean;
}

const menuItems: PizzaItem[] = [
  {
    id: 1,
    name: "Margherita Deluxe",
    description: "Fresh mozzarella, tomatoes, basil, and our signature sauce on a crispy thin crust",
    price: 14.99,
    imageSrc: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=500&fit=crop",
    category: "Classic",
    bestseller: true,
    vegetarian: true
  },
  {
    id: 2,
    name: "Pepperoni Supreme",
    description: "Loaded with pepperoni, extra cheese, and our special spice blend",
    price: 16.99,
    imageSrc: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=500&fit=crop",
    category: "Meat Lovers",
    bestseller: true
  },
  {
    id: 3,
    name: "Veggie Explosion",
    description: "Bell peppers, olives, onions, mushrooms, and tomatoes on our garden herb crust",
    price: 15.99,
    imageSrc: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&h=500&fit=crop",
    category: "Vegetarian",
    vegetarian: true
  },
  {
    id: 4,
    name: "BBQ Chicken",
    description: "Grilled chicken, red onions, and cilantro with our tangy BBQ sauce",
    price: 17.99,
    imageSrc: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop",
    category: "Specialty",
    bestseller: true
  },
  {
    id: 5,
    name: "Meat Lovers",
    description: "Pepperoni, sausage, bacon, ham, and ground beef for the ultimate meat experience",
    price: 18.99,
    imageSrc: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop",
    category: "Meat Lovers"
  },
  {
    id: 6,
    name: "Pesto Perfection",
    description: "Basil pesto base with mozzarella, cherry tomatoes, pine nuts, and parmesan cheese",
    price: 16.99,
    imageSrc: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=500&fit=crop",
    category: "Specialty",
    vegetarian: true
  },
  {
    id: 7,
    name: "Spicy Hawaiian",
    description: "Ham, pineapple, jalapeños, and a drizzle of hot honey for a sweet and spicy twist",
    price: 17.99,
    imageSrc: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&h=500&fit=crop",
    category: "Specialty"
  },
  {
    id: 8,
    name: "Mediterranean",
    description: "Olives, feta cheese, sun-dried tomatoes, artichoke hearts, and spinach",
    price: 17.99,
    imageSrc: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&h=500&fit=crop",
    category: "Specialty",
    vegetarian: true
  },
  {
    id: 9,
    name: "Buffalo Chicken",
    description: "Spicy buffalo sauce, grilled chicken, blue cheese crumbles, and a ranch drizzle",
    price: 18.99,
    imageSrc: "https://images.unsplash.com/photo-1593246049226-ded77bf90326?w=500&h=500&fit=crop",
    category: "Specialty"
  },
  {
    id: 10,
    name: "Quattro Formaggi",
    description: "Four cheese blend: mozzarella, gorgonzola, fontina, and parmesan",
    price: 16.99,
    imageSrc: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?w=500&h=500&fit=crop",
    category: "Classic",
    vegetarian: true
  },
  {
    id: 11,
    name: "Truffle Mushroom",
    description: "Wild mushroom blend, truffle oil, garlic, thyme, and fontina cheese",
    price: 19.99,
    imageSrc: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=500&fit=crop",
    category: "Gourmet",
    vegetarian: true
  },
  {
    id: 12,
    name: "Sausage & Pepper",
    description: "Italian sausage, roasted bell peppers, onions, and provolone cheese",
    price: 17.99,
    imageSrc: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&h=500&fit=crop",
    category: "Meat Lovers"
  }
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter items based on category and search query
  const filteredItems = menuItems.filter(item => 
    (activeCategory === "All" || item.category === activeCategory) && 
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Categories for filter
  const categories = ["All", "Classic", "Specialty", "Meat Lovers", "Vegetarian", "Gourmet"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-brunch-50/50 to-white">
      <Header />
      
      {/* Menu Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-16 bg-brunch-100/30">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brunch-900 leading-tight animate-fade-up">
              Our <span className="text-brunch-500">Menu</span>
            </h1>
            <p className="text-lg text-brunch-700 max-w-2xl mx-auto mt-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
              Explore our delicious pizza selection, made with fresh ingredients and crafted with passion
            </p>
          </div>
          
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brunch-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search our menu..."
                className="pl-10 pr-4 py-2 rounded-full border border-brunch-200 w-full focus:outline-none focus:ring-2 focus:ring-brunch-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className={`rounded-full px-4 py-1 ${
                    activeCategory === category 
                      ? 'bg-brunch-500 text-white hover:bg-brunch-600 border-brunch-500'
                      : 'bg-white text-brunch-700 hover:bg-brunch-50 border-brunch-200'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Menu Items Grid */}
      <section className="py-12">
        <div className="container">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Pizza className="h-16 w-16 mx-auto text-brunch-300 mb-4" />
              <h3 className="text-2xl font-medium text-brunch-700 mb-2">No pizzas found</h3>
              <p className="text-brunch-600">Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="h-full overflow-hidden border-brunch-200 card-hover">
                  <div className="relative h-48 overflow-hidden bg-brunch-100">
                    <img
                      src={item.imageSrc}
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {item.bestseller && (
                        <div className="bg-brunch-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <Flame className="w-3 h-3 mr-1" />
                          Bestseller
                        </div>
                      )}
                      {item.vegetarian && (
                        <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Vegetarian
                        </div>
                      )}
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-xl text-brunch-900">{item.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2 h-10">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-brunch-700">
                        ${item.price.toFixed(2)}
                      </p>
                      <span className="text-xs px-2 py-1 bg-brunch-100 text-brunch-700 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full bg-brunch-500 hover:bg-brunch-600">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Order
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </div>
  );
};

export default Menu;

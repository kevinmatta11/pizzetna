import React from 'react';
import { Flame, ShoppingCart } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PopularItemType = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageSrc: string;
  bestseller?: boolean;
};

const popularItems: PopularItemType[] = [
  {
    id: 1,
    name: "Margherita Deluxe",
    description: "Fresh mozzarella, tomatoes, basil, and our signature sauce on a crispy thin crust",
    price: 14.99,
    imageSrc: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=500&fit=crop",
    bestseller: true,
  },
  {
    id: 2,
    name: "Pepperoni Supreme",
    description: "Loaded with pepperoni, extra cheese, and our special spice blend",
    price: 16.99,
    imageSrc: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=500&fit=crop",
    bestseller: true,
  },
  {
    id: 3,
    name: "Veggie Explosion",
    description: "Bell peppers, olives, onions, mushrooms, and tomatoes on our garden herb crust",
    price: 15.99,
    imageSrc: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&h=500&fit=crop",
  },
  {
    id: 4,
    name: "BBQ Chicken",
    description: "Grilled chicken, red onions, and cilantro with our tangy BBQ sauce",
    price: 17.99,
    imageSrc: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop",
    bestseller: true,
  },
  {
    id: 5,
    name: "Meat Lovers",
    description: "Pepperoni, sausage, bacon, ham, and ground beef for the ultimate meat experience",
    price: 18.99,
    imageSrc: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop",
  },
];

export const PopularItems = () => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {popularItems.map((item) => (
          <CarouselItem 
            key={item.id} 
            className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <Card className="h-full overflow-hidden border-pizzetna-200 card-hover">
              <div className="relative h-48 overflow-hidden bg-pizzetna-100">
                <img
                  src={item.imageSrc}
                  alt={item.name}
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                />
                {item.bestseller && (
                  <div className="absolute top-2 right-2 bg-pizzetna-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Flame className="w-3 h-3 mr-1" />
                    Bestseller
                  </div>
                )}
              </div>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-xl text-pizzetna-900">{item.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2 h-10">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-lg font-bold text-pizzetna-700">
                  ${item.price.toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-pizzetna-500 hover:bg-pizzetna-600 text-white">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Order
                </Button>
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-8">
        <CarouselPrevious className="relative static mx-2 bg-pizzetna-500 text-white hover:bg-pizzetna-600 border-none" />
        <CarouselNext className="relative static mx-2 bg-pizzetna-500 text-white hover:bg-pizzetna-600 border-none" />
      </div>
    </Carousel>
  );
};

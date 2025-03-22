
import { Pizza, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { PopularItems } from '@/components/PopularItems';
import { Link } from 'react-router-dom';
import LocationSection from '@/components/LocationSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brunch-50/50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <span className="inline-block px-4 py-2 rounded-full bg-brunch-100 text-brunch-700 font-medium text-sm animate-fade-down">
                Premium Pizza Crafted with Love
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-brunch-900 leading-tight animate-fade-up">
                Discover the Art of <span className="text-brunch-500">Perfect Pizza</span>
              </h1>
              <p className="text-lg text-brunch-700 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
                Experience the perfect blend of crispy crust, fresh ingredients, and artisanal toppings, crafted with passion in every slice.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-up" style={{ animationDelay: '400ms' }}>
                <Link to="/menu" className="btn-primary group">
                  <span>View Our Menu</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#popular" className="btn-secondary">
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square w-full max-w-lg mx-auto animate-float">
                <div className="absolute inset-0 bg-brunch-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10">
                  <Pizza className="w-full h-full text-brunch-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Items Section */}
      <section id="popular" className="py-16 md:py-24 px-4 bg-brunch-50/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-brunch-100 text-brunch-700 font-medium text-sm animate-fade-down">
              Customer Favorites
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brunch-900 mt-4 animate-fade-up">
              Our Most Popular <span className="text-brunch-500">Pizzas</span>
            </h2>
            <p className="text-brunch-700 max-w-2xl mx-auto mt-4 animate-fade-up">
              Discover the pizzas that our customers can't get enough of. Made with the freshest ingredients and crafted to perfection.
            </p>
          </div>
          
          <PopularItems />
          
          <div className="text-center mt-12">
            <Link to="/menu" className="btn-primary">
              View Full Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Location Section */}
      <LocationSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

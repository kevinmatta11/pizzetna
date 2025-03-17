
import { Pizza, ArrowRight, Flame } from 'lucide-react';
import Header from '@/components/Header';
import { PopularItems } from '@/components/PopularItems';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brunch-50/50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
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
                <a href="#about" className="btn-secondary">
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
      <section id="popular" className="section-padding bg-brunch-50/30">
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
      
      {/* Featured Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="glass-card card-hover rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="h-12 w-12 rounded-lg bg-brunch-100 flex items-center justify-center mb-4">
                <Pizza className="h-6 w-6 text-brunch-500" />
              </div>
              <h3 className="text-xl font-semibold text-brunch-900 mb-2">Fresh Ingredients</h3>
              <p className="text-brunch-700">We use only the freshest, locally-sourced ingredients for our artisanal pizzas.</p>
            </div>
            {/* Add more feature cards similarly */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;


import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed w-full top-0 left-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm'
          : 'bg-transparent py-6'
      )}
    >
      <div className="container flex items-center justify-between">
        <a 
          href="#" 
          className="relative z-10 text-brunch-900 font-display font-bold text-2xl"
        >
          <span className="text-brunch-500">Brunch</span>Munch
        </a>

        <div className="lg:hidden">
          <button
            className="p-2 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-brunch-900" />
            ) : (
              <Menu className="h-6 w-6 text-brunch-900" />
            )}
          </button>
        </div>

        <nav
          className={cn(
            'fixed lg:static inset-0 bg-white/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none flex flex-col lg:flex-row items-center justify-center lg:justify-end space-y-8 lg:space-y-0 lg:space-x-10 transition-all duration-300 transform',
            isOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100 invisible lg:visible'
          )}
        >
          <button
            className="absolute top-5 right-5 p-2 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6 text-brunch-900" />
          </button>

          <a 
            href="#about" 
            className="text-brunch-900 hover:text-brunch-500 font-medium transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            About
          </a>
          <a 
            href="#menu" 
            className="text-brunch-900 hover:text-brunch-500 font-medium transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Menu
          </a>
          <a 
            href="#specials" 
            className="text-br

unch-900 hover:text-brunch-500 font-medium transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Specials
          </a>
          <a 
            href="#contact" 
            className="text-brunch-900 hover:text-brunch-500 font-medium transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </a>
          <button 
            className="btn-primary flex items-center space-x-2"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Order Now</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

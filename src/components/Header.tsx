
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Cart } from '@/components/Cart';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`fixed w-full z-30 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-display font-bold text-brunch-900">Pizza<span className="text-brunch-500">Brunch</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({ isActive }) => 
            `text-sm font-medium transition ${isActive 
              ? 'text-brunch-500' 
              : 'text-brunch-700 hover:text-brunch-500'}`
          }>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => 
            `text-sm font-medium transition ${isActive 
              ? 'text-brunch-500' 
              : 'text-brunch-700 hover:text-brunch-500'}`
          }>
            Menu
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 
            `text-sm font-medium transition ${isActive 
              ? 'text-brunch-500' 
              : 'text-brunch-700 hover:text-brunch-500'}`
          }>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => 
            `text-sm font-medium transition ${isActive 
              ? 'text-brunch-500' 
              : 'text-brunch-700 hover:text-brunch-500'}`
          }>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Cart />

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] md:hidden">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLink to="/" className={({ isActive }) => 
                  `py-2 text-base font-medium transition ${isActive 
                    ? 'text-brunch-500' 
                    : 'text-brunch-700 hover:text-brunch-500'}`
                }>
                  Home
                </NavLink>
                <NavLink to="/menu" className={({ isActive }) => 
                  `py-2 text-base font-medium transition ${isActive 
                    ? 'text-brunch-500' 
                    : 'text-brunch-700 hover:text-brunch-500'}`
                }>
                  Menu
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => 
                  `py-2 text-base font-medium transition ${isActive 
                    ? 'text-brunch-500' 
                    : 'text-brunch-700 hover:text-brunch-500'}`
                }>
                  About
                </NavLink>
                <NavLink to="/contact" className={({ isActive }) => 
                  `py-2 text-base font-medium transition ${isActive 
                    ? 'text-brunch-500' 
                    : 'text-brunch-700 hover:text-brunch-500'}`
                }>
                  Contact
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

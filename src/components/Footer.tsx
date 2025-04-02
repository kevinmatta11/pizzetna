
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-pizzetna-900 text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Pizzetna</h3>
            <p className="text-brunch-200 text-sm">Crafting premium pizzas with passion since 2010. Every slice tells our story of quality and tradition.</p>
            <div className="flex space-x-4 pt-2">
              <a href="https://instagram.com" className="text-pizzetna-200 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" className="text-pizzetna-200 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-pizzetna-200 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Opening Hours</h3>
            <div className="space-y-2 text-pizzetna-200">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Monday - Friday: 11am - 10pm</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Saturday: 11am - 11pm</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Sunday: 12pm - 9pm</span>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-2 text-pizzetna-200">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>123 Pizza Street, Foodville, NY 10001</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@pizzaartisan.com</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/menu" className="text-pizzetna-200 hover:text-white transition-colors">Our Menu</Link>
              </li>
              <li>
                <Link to="/about" className="text-pizzetna-200 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/auth" className="text-pizzetna-200 hover:text-white transition-colors">Login / Register</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="bg-pizzetna-700 my-6" />
        
        <div className="text-center text-pizzetna-400 text-sm">
          <p>&copy; {currentYear} Pizzetna. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

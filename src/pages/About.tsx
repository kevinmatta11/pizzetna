
import React from 'react';
import Header from '@/components/Header';
import PageHeader from '@/components/PageHeader';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-20">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Our Story" 
          description="Bringing the authentic taste of Italy to your neighborhood since 2010"
        />
        
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                alt="Our Pizza Shop" 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="prose prose-lg">
              <h2 className="text-3xl font-display text-brunch-900 mb-4">A Passion for Perfect Pizza</h2>
              <p className="text-brunch-700 mb-4">
                Welcome to PizzaBrunch, where our journey began with a simple dream: to create the perfect pizza experience for our community. What started as a family recipe passed down through generations has evolved into a beloved local institution.
              </p>
              <p className="text-brunch-700 mb-4">
                Our founder, Chef Marco, brought his culinary expertise from Naples to create authentic pizzas using only the freshest ingredients. Each pizza is crafted with care, combining traditional techniques with innovative flavors that delight our customers.
              </p>
              <p className="text-brunch-700">
                Today, PizzaBrunch stands as a testament to our commitment to quality, flavor, and the joy of sharing good food with friends and family.
              </p>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-8 shadow-md mb-16">
            <h2 className="text-3xl font-display text-center text-brunch-900 mb-8">What Sets Us Apart</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-brunch-800 mb-3">Fresh Ingredients</h3>
                <p className="text-brunch-600">We source locally whenever possible, ensuring the freshest ingredients make it onto your pizza.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-brunch-800 mb-3">Authentic Recipes</h3>
                <p className="text-brunch-600">Our recipes have been perfected over generations, bringing you a true taste of Italian tradition.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold text-brunch-800 mb-3">Community Focus</h3>
                <p className="text-brunch-600">We're proud to be part of this community and strive to give back through local partnerships.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-orange-400 text-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-display text-center mb-8">Visit Us Today</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 flex-shrink-0" />
                  <p>123 Pizza Street, Flavortown, FL 12345</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 flex-shrink-0" />
                  <p>+1 (555) 123-4567</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 flex-shrink-0" />
                  <p>hello@pizzabrunch.com</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p>Monday - Thursday: 11am - 10pm</p>
                    <p>Friday - Saturday: 11am - 11pm</p>
                    <p>Sunday: 12pm - 9pm</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-xl h-64">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.6030727509!2d-74.00714!3d40.712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQzLjIiTiA3NMKwMDAnMjUuNyJX!5e0!3m2!1sen!2sus!4v1620172494643!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy"
                  title="Restaurant Location"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

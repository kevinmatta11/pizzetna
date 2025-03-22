
import React from 'react';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LocationSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-brunch-50/30">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-brunch-100 text-brunch-700 font-medium text-sm animate-fade-down">
            Visit Us Today
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brunch-900 mt-4 animate-fade-up">
            Where To <span className="text-brunch-500">Find Us</span>
          </h2>
          <p className="text-brunch-700 max-w-2xl mx-auto mt-4 animate-fade-up">
            Come experience our artisanal pizzas in our cozy, welcoming space. We're conveniently located in the heart of the city.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-lg overflow-hidden shadow-lg animate-fade-up h-[300px] md:h-[400px]">
            <iframe
              title="Restaurant Location"
              className="w-full h-full border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9914406081613!2d-74.00597367601129!3d40.71277404512855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3c30b7f%3A0xb89d1fe6bc499443!2sLittle%20Italy%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1697401743459!5m2!1sen!2sus"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="bg-brunch-100 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-brunch-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Our Address</h3>
                    <p className="text-brunch-700">123 Pizza Street, Little Italy</p>
                    <p className="text-brunch-700">New York, NY 10013</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="bg-brunch-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-brunch-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Opening Hours</h3>
                    <p className="text-brunch-700">Monday - Friday: 11am - 10pm</p>
                    <p className="text-brunch-700">Weekends: 11am - 11pm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="bg-brunch-100 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-brunch-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
                    <p className="text-brunch-700">Phone: (555) 123-4567</p>
                    <p className="text-brunch-700">Email: info@pizzaartisan.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-brunch-600 hover:text-brunch-800 font-medium">
              <span>Get directions</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;

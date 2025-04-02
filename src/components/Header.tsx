import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, LogOut, User, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Cart } from '@/components/Cart';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <header className={`fixed w-full z-30 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/pizzetnaLogo.png" 
            alt="Pizzetna" 
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({ isActive }) => 
            `text-sm font-medium transition ${isActive 
              ? 'text-pizzetna-500' 
              : 'text-black hover:text-pizzetna-500'}`
          }>
            Home
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => 
            `text-sm font-medium transition ${isActive 
              ? 'text-pizzetna-500' 
              : 'text-black hover:text-pizzetna-500'}`
          }>
            Menu
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => 
            `text-sm font-medium transition ${isActive 
              ? 'text-pizzetna-500' 
              : 'text-black hover:text-pizzetna-500'}`
          }>
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="h-4 w-4" />
                      {user.email?.split('@')[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/addresses')}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Addresses
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/loyalty')}>
                      <User className="h-4 w-4 mr-2" />
                      Loyalty Points
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" className="gap-2" onClick={() => navigate("/auth")}>
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                  <Button className="bg-pizzetna-500 hover:bg-pizzetna-600 text-white gap-2" onClick={() => navigate("/auth?tab=signup")}>
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Button>
                </>
              )
            )}
          </div>
          
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
                    ? 'text-pizzetna-500' 
                    : 'text-black hover:text-pizzetna-500'}`
                }>
                  Home
                </NavLink>
                <NavLink to="/menu" className={({ isActive }) => 
                  `py-2 text-base font-medium transition ${isActive 
                    ? 'text-pizzetna-500' 
                    : 'text-black hover:text-pizzetna-500'}`
                }>
                  Menu
                </NavLink>
                <NavLink to="/about" className={({ isActive }) => 
                  `py-2 text-base font-medium transition ${isActive 
                    ? 'text-pizzetna-500' 
                    : 'text-black hover:text-pizzetna-500'}`
                }>
                  About
                </NavLink>
                <div className="flex flex-col gap-2 mt-4">
                  {!isLoading && (
                    user ? (
                      <>
                        <div className="flex items-center gap-2 py-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                        </div>
                        <Button variant="outline" className="gap-2 justify-start" onClick={() => navigate('/addresses')}>
                          <MapPin className="h-4 w-4" />
                          Addresses
                        </Button>
                        <Button variant="outline" className="gap-2 justify-start" onClick={() => navigate('/loyalty')}>
                          <User className="h-4 w-4" />
                          Loyalty Points
                        </Button>
                        <Button onClick={handleSignOut} variant="outline" className="gap-2 justify-start">
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" className="gap-2 justify-start" onClick={() => navigate("/auth")}>
                          <LogIn className="h-4 w-4" />
                          Login
                        </Button>
                        <Button className="bg-pizzetna-500 hover:bg-pizzetna-600 text-white gap-2 justify-start" onClick={() => navigate("/auth?tab=signup")}>
                          <UserPlus className="h-4 w-4" />
                          Register
                        </Button>
                      </>
                    )
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

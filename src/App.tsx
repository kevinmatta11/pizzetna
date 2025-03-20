
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";

// Admin pages
import AdminLayout from "./pages/Admin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMenuItems from "./pages/admin/MenuItems";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="menu" element={<AdminMenuItems />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

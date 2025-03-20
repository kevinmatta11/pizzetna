
import { useState, useEffect } from "react";
import { Navigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, PizzaIcon, Tag, Package, ShoppingCart, BarChart2, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminLayout = () => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setAdminCheckLoading(false);
        return;
      }

      try {
        // Call the RPC function to check if user is admin
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (error) throw error;
        
        setIsAdmin(data);
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        toast.error("Failed to verify admin status");
        setIsAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Show loading state when checking authentication or admin status
  if (isLoading || adminCheckLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex">
          {/* Sidebar skeleton */}
          <div className="hidden md:flex w-64 flex-col border-r p-6">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex-1 p-6">
            <Skeleton className="h-12 w-[250px] mb-8" />
            <div className="grid gap-6">
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!user || isAdmin === false) {
    toast.error("You don't have permission to access the admin area");
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/menu", label: "Menu Items", icon: PizzaIcon },
    { to: "/admin/categories", label: "Categories", icon: Tag },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart2 },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col border-r p-6">
          <div className="flex items-center gap-2 mb-8">
            <Package className="h-6 w-6 text-brunch-500" />
            <h1 className="font-semibold text-xl">Admin Panel</h1>
          </div>
          
          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon, exact }) => {
              const isActive = exact 
                ? location.pathname === to 
                : location.pathname.startsWith(to);
              
              return (
                <Link key={to} to={to}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

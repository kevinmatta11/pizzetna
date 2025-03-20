
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Eye, ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Order = {
  id: string;
  user_id: string;
  user_email?: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  itemCount?: number;
};

type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name?: string;
  quantity: number;
  price: number;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Fetch orders on load
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            auth_users:user_id (email)
          `)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Count items per order
        const { data: orderCountsData, error: countsError } = await supabase
          .from("order_items")
          .select("order_id, count")
          .select("order_id, quantity")
          .order("order_id");

        if (countsError) throw countsError;
        
        // Create a map of order_id -> item count
        const orderCounts = new Map<string, number>();
        orderCountsData.forEach((item) => {
          const currentCount = orderCounts.get(item.order_id) || 0;
          orderCounts.set(item.order_id, currentCount + item.quantity);
        });

        // Format orders with user email and item count
        const formattedOrders: Order[] = ordersData.map((order: any) => ({
          ...order,
          user_email: order.auth_users?.email || "Unknown",
          itemCount: orderCounts.get(order.id) || 0
        }));

        setOrders(formattedOrders);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle view order details
  const handleViewOrderDetails = async (orderId: string) => {
    setViewingOrder(orderId);
    setViewDialogOpen(true);
    setLoadingOrderDetails(true);
    
    try {
      // Fetch order items with menu item details
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          menu_items:menu_item_id (name)
        `)
        .eq("order_id", orderId);

      if (error) throw error;
      
      // Format order items with menu item name
      const formattedItems: OrderItem[] = data.map((item: any) => ({
        ...item,
        menu_item_name: item.menu_items?.name || "Unknown Item"
      }));
      
      setOrderItems(formattedItems);
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // Handle update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      
      // Update order in local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => 
      (
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
      ) &&
      (statusFilter === "" || order.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortField === "total_amount" || sortField === "itemCount") {
        return sortDirection === "asc" 
          ? (a[sortField as keyof Order] as number) - (b[sortField as keyof Order] as number)
          : (b[sortField as keyof Order] as number) - (a[sortField as keyof Order] as number);
      } else if (sortField === "created_at") {
        return sortDirection === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        const aValue = a[sortField as keyof Order] || "";
        const bValue = b[sortField as keyof Order] || "";
        
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("id")}>
                  Order ID {renderSortIcon("id")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("user_email")}>
                  Customer {renderSortIcon("user_email")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("created_at")}>
                  Date {renderSortIcon("created_at")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("total_amount")}>
                  Total {renderSortIcon("total_amount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("itemCount")}>
                  Items {renderSortIcon("itemCount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("status")}>
                  Status {renderSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.user_email}</TableCell>
                  <TableCell>{format(new Date(order.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>${parseFloat(order.total_amount.toString()).toFixed(2)}</TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell>
                    <div className="w-32">
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleUpdateStatus(order.id, value)}
                      >
                        <SelectTrigger className={`
                          w-full border-0 focus:ring-0 p-2 text-xs font-medium rounded-full
                          ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${order.status === "processing" ? "bg-blue-100 text-blue-800" : ""}
                          ${order.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          ${order.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                        `}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewOrderDetails(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {loadingOrderDetails ? (
            <div className="py-8 text-center">Loading order details...</div>
          ) : (
            <>
              <div className="py-4">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.menu_item_name}</TableCell>
                          <TableCell>${parseFloat(item.price.toString()).toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">
                    ${orderItems.reduce((sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;

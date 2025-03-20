
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PizzaIcon, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

const AdminDashboard = () => {
  const [topSellingPizzas, setTopSellingPizzas] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalMenuItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data
    // In a real implementation, you would fetch this from Supabase
    
    const mockTopSellingPizzas = [
      { name: "Pepperoni", value: 120 },
      { name: "Margherita", value: 98 },
      { name: "BBQ Chicken", value: 86 },
      { name: "Vegetarian", value: 75 },
      { name: "Supreme", value: 65 }
    ];
    
    const mockSalesByCategory = [
      { name: "Classic", value: 350 },
      { name: "Vegetarian", value: 200 },
      { name: "Specialty", value: 300 },
      { name: "Spicy", value: 180 },
      { name: "Seafood", value: 120 },
      { name: "Dessert", value: 80 }
    ];
    
    const mockRecentOrders = [
      { id: "ORD-001", customer: "John Doe", total: "$45.99", status: "Delivered", date: "2023-09-01" },
      { id: "ORD-002", customer: "Jane Smith", total: "$32.50", status: "Processing", date: "2023-09-01" },
      { id: "ORD-003", customer: "Bob Johnson", total: "$78.25", status: "Pending", date: "2023-09-01" },
      { id: "ORD-004", customer: "Alice Brown", total: "$56.75", status: "Delivered", date: "2023-08-31" },
      { id: "ORD-005", customer: "Charlie Wilson", total: "$29.99", status: "Delivered", date: "2023-08-31" }
    ];
    
    // Set the mock data
    setTopSellingPizzas(mockTopSellingPizzas);
    setSalesByCategory(mockSalesByCategory);
    setRecentOrders(mockRecentOrders);
    setTotalStats({
      totalOrders: 256,
      totalRevenue: 12890.75,
      averageOrderValue: 50.35,
      totalMenuItems: 42
    });
    
    setLoading(false);

    // In a real implementation, you would fetch data from Supabase
    // const fetchDashboardData = async () => {
    //   try {
    //     // Fetch data from Supabase here
    //   } catch (error) {
    //     console.error("Error fetching dashboard data:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchDashboardData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your restaurant performance
          </p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                Total Orders
              </p>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="pt-2">
              <h2 className="text-3xl font-bold">{totalStats.totalOrders}</h2>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="pt-2">
              <h2 className="text-3xl font-bold">${totalStats.totalRevenue.toLocaleString()}</h2>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Order Value
              </p>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="pt-2">
              <h2 className="text-3xl font-bold">${totalStats.averageOrderValue.toFixed(2)}</h2>
              <p className="text-xs text-muted-foreground">
                +2% from last month
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0">
              <p className="text-sm font-medium text-muted-foreground">
                Menu Items
              </p>
              <PizzaIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="pt-2">
              <h2 className="text-3xl font-bold">{totalStats.totalMenuItems}</h2>
              <p className="text-xs text-muted-foreground">
                +5 new items
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="sales" className="mb-8">
        <TabsList>
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>
                Sales distribution across different pizza categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ChartContainer
                  config={{
                    sales: { label: "Sales", color: "#3498db" },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesByCategory}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Category
                                    </span>
                                    <span className="font-bold">
                                      {payload[0].payload.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Sales
                                    </span>
                                    <span className="font-bold">
                                      {payload[0].payload.value}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="value" fill="#3498db" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Pizzas</CardTitle>
              <CardDescription>
                Most popular items by sales volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topSellingPizzas}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {topSellingPizzas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Pizza
                                  </span>
                                  <span className="font-bold">
                                    {payload[0].name}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Sales
                                  </span>
                                  <span className="font-bold">
                                    {payload[0].value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Total</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4">{order.date}</td>
                    <td className="py-3 px-4">{order.total}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { toast } from "sonner";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("week");
  
  // Mock data for demo purposes
  const [salesOverTime, setSalesOverTime] = useState([
    { name: "Mon", sales: 1200 },
    { name: "Tue", sales: 1800 },
    { name: "Wed", sales: 1400 },
    { name: "Thu", sales: 2200 },
    { name: "Fri", sales: 2800 },
    { name: "Sat", sales: 3500 },
    { name: "Sun", sales: 2900 }
  ]);
  
  const [salesByCategory, setSalesByCategory] = useState([
    { name: "Classic", value: 35 },
    { name: "Vegetarian", value: 20 },
    { name: "Specialty", value: 30 },
    { name: "Spicy", value: 18 },
    { name: "Seafood", value: 12 },
    { name: "Dessert", value: 8 }
  ]);
  
  const [topProducts, setTopProducts] = useState([
    { name: "Pepperoni", value: 120 },
    { name: "Margherita", value: 98 },
    { name: "BBQ Chicken", value: 86 },
    { name: "Vegetarian", value: 75 },
    { name: "Supreme", value: 65 }
  ]);
  
  const [hourlyOrders, setHourlyOrders] = useState([
    { hour: "8 AM", orders: 5 },
    { hour: "9 AM", orders: 8 },
    { hour: "10 AM", orders: 12 },
    { hour: "11 AM", orders: 15 },
    { hour: "12 PM", orders: 25 },
    { hour: "1 PM", orders: 30 },
    { hour: "2 PM", orders: 22 },
    { hour: "3 PM", orders: 18 },
    { hour: "4 PM", orders: 15 },
    { hour: "5 PM", orders: 20 },
    { hour: "6 PM", orders: 35 },
    { hour: "7 PM", orders: 45 },
    { hour: "8 PM", orders: 40 },
    { hour: "9 PM", orders: 30 },
    { hour: "10 PM", orders: 15 }
  ]);

  useEffect(() => {
    // In a real implementation, this would fetch data from Supabase
    // Simulate data change based on selected time range
    if (timeRange === "week") {
      setSalesOverTime([
        { name: "Mon", sales: 1200 },
        { name: "Tue", sales: 1800 },
        { name: "Wed", sales: 1400 },
        { name: "Thu", sales: 2200 },
        { name: "Fri", sales: 2800 },
        { name: "Sat", sales: 3500 },
        { name: "Sun", sales: 2900 }
      ]);
    } else if (timeRange === "month") {
      setSalesOverTime([
        { name: "Week 1", sales: 9800 },
        { name: "Week 2", sales: 11200 },
        { name: "Week 3", sales: 10500 },
        { name: "Week 4", sales: 12500 }
      ]);
    } else if (timeRange === "year") {
      setSalesOverTime([
        { name: "Jan", sales: 38000 },
        { name: "Feb", sales: 42000 },
        { name: "Mar", sales: 47000 },
        { name: "Apr", sales: 45000 },
        { name: "May", sales: 48000 },
        { name: "Jun", sales: 52000 },
        { name: "Jul", sales: 58000 },
        { name: "Aug", sales: 55000 },
        { name: "Sep", sales: 50000 },
        { name: "Oct", sales: 49000 },
        { name: "Nov", sales: 51000 },
        { name: "Dec", sales: 62000 }
      ]);
    }
  }, [timeRange]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your restaurant's performance metrics
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-8">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Trends</TabsTrigger>
        </TabsList>
        
        {/* Sales Overview */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Track your revenue trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesOverTime}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, "Sales"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Product Analysis */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Most popular items by sales volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      width={100}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      name="Sales" 
                      fill="#8884d8" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Category Breakdown */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Distribution of sales across different menu categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={160}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Hourly Trends */}
        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Hour</CardTitle>
              <CardDescription>
                See when your restaurant is busiest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyOrders}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="orders" 
                      name="Orders" 
                      fill="#82ca9d" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;

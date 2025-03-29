
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

const AdminAnalytics = () => {
  const { session } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [analyticsData, setAnalyticsData] = useState({
    salesOverTime: [],
    salesByCategory: [],
    topProducts: [],
    hourlyOrders: []
  });
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!session?.access_token) {
          throw new Error("No access token available");
        }
        
        // Get the Supabase URL from environment
        const supabaseUrl = "https://rvduyqzejmmwwixtuevy.supabase.co";
        
        // Call our edge function to get analytics data with timeRange
        const response = await fetch(`${supabaseUrl}/functions/v1/admin-get-stats?timeRange=${timeRange}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        setAnalyticsData({
          salesOverTime: data.salesOverTime || [],
          salesByCategory: data.salesByCategory || [],
          topProducts: data.topSellingPizzas || [],
          hourlyOrders: data.hourlyOrders || []
        });
      } catch (error: any) {
        console.error("Error fetching analytics data:", error);
        setError(error.message || "Failed to load analytics data");
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAnalyticsData();
    }
  }, [session, timeRange]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-40 mt-4 md:mt-0" />
        </div>
        <Skeleton className="h-10 w-full max-w-md mb-8" />
        <Skeleton className="h-[400px] w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your restaurant's performance metrics
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="mt-4 md:mt-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Main Site
            </Button>
          </Link>
        </div>
        <div className="p-6 border border-red-200 bg-red-50 rounded-lg text-red-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { salesOverTime, salesByCategory, topProducts, hourlyOrders } = analyticsData;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your restaurant's performance metrics
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4">
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
          
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Main Site
            </Button>
          </Link>
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
                {salesOverTime.length > 0 ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No sales data available for this time period
                  </div>
                )}
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
                {topProducts.length > 0 ? (
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
                        name="Quantity Sold" 
                        fill="#8884d8" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No product data available for this time period
                  </div>
                )}
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
                {salesByCategory.length > 0 ? (
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
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Sales"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No category data available for this time period
                  </div>
                )}
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
                {hourlyOrders.length > 0 ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No hourly data available for this time period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the token from the request
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { user_id: user.id })
    
    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get URL params for time range if provided
    const url = new URL(req.url)
    const timeRange = url.searchParams.get('timeRange') || 'week'

    // Initialize response data structure
    let responseData = {
      totalStats: {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalMenuItems: 0
      },
      salesByCategory: [],
      topSellingPizzas: [],
      recentOrders: [],
      salesOverTime: [],
      hourlyOrders: []
    }

    // Fetch total stats
    const { data: totalOrdersData } = await supabase
      .from('orders')
      .select('id')
    
    const { data: totalRevenueData } = await supabase
      .from('orders')
      .select('total_amount')
    
    const { data: menuItemsData } = await supabase
      .from('menu_items')
      .select('id')

    // Calculate total revenue and average order value
    const totalOrders = totalOrdersData?.length || 0
    const totalRevenue = totalRevenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalMenuItems = menuItemsData?.length || 0

    responseData.totalStats = {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalMenuItems
    }

    // Fetch recent orders with status
    const { data: recentOrdersData } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        user_id,
        profiles(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentOrdersData) {
      responseData.recentOrders = recentOrdersData.map(order => ({
        id: order.id,
        customer: order.profiles?.first_name && order.profiles?.last_name 
          ? `${order.profiles.first_name} ${order.profiles.last_name}`
          : order.profiles?.email || order.user_id || 'Guest',
        total: `$${Number(order.total_amount).toFixed(2)}`,
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString()
      }))
    }

    // Get sales by category
    const { data: categorySalesData } = await supabase.rpc('get_sales_by_category')
    
    if (categorySalesData) {
      responseData.salesByCategory = categorySalesData.map(item => ({
        name: item.category_name,
        value: Number(item.total_sales)
      }))
    }

    // Get top selling pizzas
    const { data: topPizzasData } = await supabase.rpc('get_top_selling_items', { limit_count: 5 })
    
    if (topPizzasData) {
      responseData.topSellingPizzas = topPizzasData.map(item => ({
        name: item.item_name,
        value: Number(item.quantity_sold)
      }))
    }

    // Get sales over time based on timeRange
    const { data: salesOverTimeData } = await supabase.rpc('get_sales_over_time', { time_range: timeRange })
    
    if (salesOverTimeData) {
      responseData.salesOverTime = salesOverTimeData.map(item => ({
        name: item.time_period,
        sales: Number(item.total_sales)
      }))
    }

    // Get hourly order distribution
    const { data: hourlyOrdersData } = await supabase.rpc('get_hourly_orders')
    
    if (hourlyOrdersData) {
      responseData.hourlyOrders = hourlyOrdersData.map(item => ({
        hour: item.hour_of_day,
        orders: Number(item.order_count)
      }))
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

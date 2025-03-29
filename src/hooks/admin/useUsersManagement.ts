
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserWithLoyalty } from "@/types/user";
import { useNavigate } from "react-router-dom";

export const useUsersManagement = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithLoyalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [pointsAdjustment, setPointsAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);

  // Fetch users on load or when auth state changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Starting to fetch users...");
        
        if (!user) {
          throw new Error("You must be logged in to access this page");
        }
        
        if (!session?.access_token) {
          // If no session but user exists, likely the session expired
          toast.error("Your session has expired. Please log in again.");
          navigate("/auth");
          return;
        }
        
        // Get the Supabase URL from environment
        const supabaseUrl = "https://rvduyqzejmmwwixtuevy.supabase.co";
        if (!supabaseUrl) {
          throw new Error("Supabase URL is not defined");
        }
        
        console.log(`Calling edge function at: ${supabaseUrl}/functions/v1/admin-get-users`);
        
        // Call our edge function to get users data with fresh access token
        const response = await fetch(`${supabaseUrl}/functions/v1/admin-get-users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Check if the response is OK
        if (!response.ok) {
          // Try to parse error JSON if possible
          let errorMessage = `HTTP error! status: ${response.status}`;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
              
              // If unauthorized, redirect to login
              if (response.status === 401 || response.status === 403) {
                toast.error("You don't have permission to access this page");
                navigate("/auth");
                return;
              }
            } catch (e) {
              console.error("Error parsing JSON response:", e);
            }
          } else {
            // If we can't parse JSON, use text content as fallback
            const textContent = await response.text();
            console.error("Non-JSON response:", textContent.substring(0, 200) + "...");
            errorMessage = `Failed to fetch users: ${response.statusText}. Response was not JSON.`;
          }
          throw new Error(errorMessage);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log("Retrieved user data:", data);
        
        if (!data.users || !Array.isArray(data.users)) {
          throw new Error("Invalid response format: users array missing");
        }
        
        setUsers(data.users);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        setError(error.message || "Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is present
    if (user) {
      fetchUsers();
    } else {
      // If no user, we're likely not logged in
      setLoading(false);
      setError("You must be logged in to access this page");
    }
  }, [user, session, navigate]);

  // Handle adjusting user points
  const handleAdjustPoints = async () => {
    if (!editingUser || !pointsAdjustment) {
      toast.error("Please select a user and enter a valid points amount");
      return;
    }
    
    try {
      // Use the RPC to adjust points
      const { data, error } = await supabase.rpc(
        'add_loyalty_points',
        {
          user_uuid: editingUser,
          points_to_add: pointsAdjustment,
          transaction_type: 'admin_adjustment',
          description: adjustmentReason || "Admin adjustment"
        }
      );
      
      if (error) throw error;
      
      // Update user in local state
      setUsers(users.map(user => 
        user.id === editingUser 
          ? { ...user, points_balance: user.points_balance + pointsAdjustment } 
          : user
      ));
      
      toast.success(`Points ${pointsAdjustment > 0 ? "added" : "deducted"} successfully`);
      
      // Clear form
      setPointsAdjustment(0);
      setAdjustmentReason("");
      setEditingUser(null);
      setAdjustDialogOpen(false);
    } catch (error: any) {
      console.error("Error adjusting points:", error);
      toast.error("Failed to adjust points");
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

  const handleEditUser = (userId: string) => {
    setEditingUser(userId);
    setAdjustDialogOpen(true);
  };

  return {
    users,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    handleSort,
    editingUser,
    pointsAdjustment,
    setPointsAdjustment,
    adjustmentReason,
    setAdjustmentReason,
    adjustDialogOpen,
    setAdjustDialogOpen,
    handleAdjustPoints,
    handleEditUser
  };
};

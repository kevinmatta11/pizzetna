
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Edit, ArrowUpDown, ArrowUp, ArrowDown, 
  AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

type UserWithLoyalty = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  points_balance: number;
  profile?: any;
};

const AdminUsers = () => {
  const { user, session } = useAuth();
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

  // Fetch users on load
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Starting to fetch users...");
        
        if (!session?.access_token) {
          throw new Error("No access token available");
        }
        
        // Verify the URL is correctly formed
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
          throw new Error("VITE_SUPABASE_URL is not defined");
        }
        
        console.log(`Calling edge function at: ${supabaseUrl}/functions/v1/admin-get-users`);
        
        // Call our edge function to get users data
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
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
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

    if (user) {
      fetchUsers();
    }
  }, [user, session]);

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

  // Filter and sort users
  const filteredUsers = users
    .filter(user => 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "points_balance") {
        return sortDirection === "asc" 
          ? a.points_balance - b.points_balance
          : b.points_balance - a.points_balance;
      } else if (sortField === "created_at" || sortField === "last_sign_in_at") {
        const aDate = a[sortField as keyof UserWithLoyalty] 
          ? new Date(a[sortField as keyof UserWithLoyalty] as string).getTime() 
          : 0;
        const bDate = b[sortField as keyof UserWithLoyalty] 
          ? new Date(b[sortField as keyof UserWithLoyalty] as string).getTime() 
          : 0;
        
        return sortDirection === "asc"
          ? aDate - bDate
          : bDate - aDate;
      } else {
        const aValue = String(a[sortField as keyof UserWithLoyalty] || "");
        const bValue = String(b[sortField as keyof UserWithLoyalty] || "");
        
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users and their loyalty points
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Error message if needed */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Error loading users</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2">
              To fix this issue, make sure your Supabase admin settings are properly configured and you have
              the correct permissions.
            </p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("email")}>
                  Email {renderSortIcon("email")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("created_at")}>
                  Joined {renderSortIcon("created_at")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("last_sign_in_at")}>
                  Last Login {renderSortIcon("last_sign_in_at")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("points_balance")}>
                  Points Balance {renderSortIcon("points_balance")}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 h-[200px]">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span className="text-muted-foreground">Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 h-[200px]">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>No users found</p>
                    <p className="text-sm mt-1">
                      {searchQuery ? "Try a different search term" : "There are no users in the system yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{format(new Date(user.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? format(new Date(user.last_sign_in_at), "MMM d, yyyy h:mm a")
                      : "Never"}
                  </TableCell>
                  <TableCell className="font-medium">{user.points_balance}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingUser(user.id);
                        setAdjustDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Adjust Points Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjust Loyalty Points</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium">User</label>
              <p className="mt-1">{users.find(u => u.id === editingUser)?.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Current Balance</label>
              <p className="text-xl font-bold">
                {users.find(u => u.id === editingUser)?.points_balance || 0} points
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Points Adjustment</label>
              <Input
                type="number"
                value={pointsAdjustment}
                onChange={(e) => setPointsAdjustment(parseInt(e.target.value || "0"))}
                placeholder="Enter positive or negative number"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use positive number to add points, negative to deduct
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Reason</label>
              <Input
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Reason for adjustment"
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAdjustPoints}
              disabled={!pointsAdjustment || !adjustmentReason}
            >
              {pointsAdjustment > 0 ? "Add Points" : "Deduct Points"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

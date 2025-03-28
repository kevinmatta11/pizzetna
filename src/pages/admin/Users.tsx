
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
};

const AdminUsers = () => {
  const { user } = useAuth();
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
        
        // Get all users from auth.users table via RPC function
        const { data: authData, error: authError } = await supabase
          .from('profiles')
          .select('id, created_at');
          
        if (authError) throw authError;
        
        console.log("Retrieved profiles:", authData);
        
        if (!authData || authData.length === 0) {
          console.log("No users found in profiles");
          setUsers([]);
          setLoading(false);
          return;
        }
        
        // Get the user email addresses
        const userEmails: Record<string, any> = {};
        for (const profile of authData) {
          // Try to get user email from auth
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
            
            if (!userError && userData && userData.user) {
              userEmails[profile.id] = {
                email: userData.user.email || "Unknown",
                last_sign_in_at: userData.user.last_sign_in_at
              };
            } else {
              userEmails[profile.id] = { email: "Unknown", last_sign_in_at: null };
            }
          } catch (error) {
            console.error("Error fetching user email:", error);
            userEmails[profile.id] = { email: "Unknown", last_sign_in_at: null };
          }
        }
        
        console.log("Retrieved user emails");
        
        // Fetch loyalty points for each user
        const userPoints: Record<string, number> = {};
        
        for (const profile of authData) {
          try {
            const { data: pointsData, error: pointsError } = await supabase.rpc(
              'get_user_points_balance',
              { user_uuid: profile.id }
            );
            
            if (pointsError) throw pointsError;
            
            userPoints[profile.id] = pointsData || 0;
          } catch (error) {
            console.error("Error fetching points for user:", profile.id, error);
            userPoints[profile.id] = 0;
          }
        }
        
        console.log("Retrieved user points");
        
        // Combine user data with loyalty points
        const usersWithData: UserWithLoyalty[] = authData.map(profile => ({
          id: profile.id,
          email: userEmails[profile.id]?.email || "Unknown Email",
          created_at: profile.created_at,
          last_sign_in_at: userEmails[profile.id]?.last_sign_in_at || null,
          points_balance: userPoints[profile.id] || 0
        }));
        
        console.log("Combined user data:", usersWithData);
        
        setUsers(usersWithData);
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
  }, [user]);

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

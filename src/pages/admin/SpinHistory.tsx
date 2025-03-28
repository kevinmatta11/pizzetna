
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  Download, Loader2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useAuth } from "@/contexts/AuthContext";

type SpinRecord = {
  id: string;
  user_id: string;
  user_email?: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
};

const AdminSpinHistory = () => {
  const { user } = useAuth();
  const [spinHistory, setSpinHistory] = useState<SpinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch spin history on load
  useEffect(() => {
    const fetchSpinHistory = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching spin history...");
        
        // Fetch spin history from loyalty_transactions table
        const { data: spinData, error: spinError } = await supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('transaction_type', 'wheel_spin')
          .order('created_at', { ascending: false });
        
        if (spinError) throw spinError;
        
        console.log("Spin data retrieved:", spinData?.length || 0, "records");
        
        if (!spinData || spinData.length === 0) {
          setSpinHistory([]);
          setLoading(false);
          return;
        }
        
        // Map user IDs to email addresses
        const userEmails: Record<string, string> = {};
        const uniqueUserIds = [...new Set(spinData.map(record => record.user_id))];
        
        console.log("Unique user IDs:", uniqueUserIds.length);
        
        // Get user emails
        for (const userId of uniqueUserIds) {
          try {
            // First try to get the user from auth.users (admin only)
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
            
            if (!userError && userData && userData.user) {
              userEmails[userId] = userData.user.email || "Unknown Email";
            } else {
              // Fallback: try to get basic info from public profiles table
              userEmails[userId] = `User ${userId.substring(0, 8)}`;
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            userEmails[userId] = `User ${userId.substring(0, 8)}`;
          }
        }
        
        console.log("User emails retrieved");
        
        // Combine spin data with user emails
        const spinRecords: SpinRecord[] = spinData.map(record => ({
          ...record,
          user_email: userEmails[record.user_id] || "Unknown User"
        }));
        
        console.log("Combined spin records:", spinRecords.length);
        
        setSpinHistory(spinRecords);
      } catch (error: any) {
        console.error("Error fetching spin history:", error);
        setError(error.message || "Failed to load spin history");
        toast.error("Failed to load spin history");
      } finally {
        setLoading(false);
      }
    };

    fetchSpinHistory();
  }, [user]);

  // Handle exporting data to CSV
  const handleExport = () => {
    try {
      // Create CSV content
      const csvContent = [
        ["ID", "User", "Points Won", "Date", "Description"].join(","),
        ...filteredSpinHistory.map(record => [
          record.id,
          record.user_email,
          record.amount,
          new Date(record.created_at).toLocaleString(),
          record.description || ""
        ].join(","))
      ].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `spin_history_${new Date().toISOString()}.csv`);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Spin history exported successfully");
    } catch (error) {
      console.error("Error exporting spin history:", error);
      toast.error("Failed to export spin history");
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

  // Filter by date range
  const filterByDateRange = (record: SpinRecord) => {
    if (!dateRange?.from) return true;
    
    const recordDate = new Date(record.created_at);
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      return recordDate >= fromDate && recordDate <= toDate;
    }
    
    return recordDate.getDate() === fromDate.getDate() &&
           recordDate.getMonth() === fromDate.getMonth() &&
           recordDate.getFullYear() === fromDate.getFullYear();
  };

  // Filter and sort spin history
  const filteredSpinHistory = spinHistory
    .filter(record => 
      record.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(record.amount).includes(searchQuery)
    )
    .filter(filterByDateRange)
    .sort((a, b) => {
      if (sortField === "amount") {
        return sortDirection === "asc" 
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortField === "created_at") {
        return sortDirection === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        const aValue = String(a[sortField as keyof SpinRecord] || "");
        const bValue = String(b[sortField as keyof SpinRecord] || "");
        
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
          <h1 className="text-3xl font-bold tracking-tight">Spin the Wheel History</h1>
          <p className="text-muted-foreground">
            View and analyze user rewards from the Spin the Wheel game
          </p>
        </div>
        
        <Button
          onClick={handleExport}
          className="mt-4 md:mt-0"
          disabled={filteredSpinHistory.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Error message if needed */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Error loading spin history</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2">
              To fix this issue, make sure your Supabase admin settings are properly configured and you have
              the correct permissions.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user or points..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <DateRangePicker 
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Spin History Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("user_email")}>
                  User {renderSortIcon("user_email")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("amount")}>
                  Points Won {renderSortIcon("amount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("created_at")}>
                  Date {renderSortIcon("created_at")}
                </Button>
              </TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 h-[200px]">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span className="text-muted-foreground">Loading spin history...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSpinHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 h-[200px]">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>No spin history found</p>
                    <p className="text-sm mt-1">
                      {searchQuery || dateRange ? 
                        "Try changing your search filters" : 
                        "No users have spun the wheel yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSpinHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.user_email}</TableCell>
                  <TableCell className="font-medium">
                    {record.amount === 0 ? (
                      <span className="text-gray-500">Try Again</span>
                    ) : (
                      <span className="text-green-600">{record.amount} points</span>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(record.created_at), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>{record.description || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSpinHistory;

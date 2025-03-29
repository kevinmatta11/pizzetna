
import React from "react";
import { format } from "date-fns";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Loader2 } from "lucide-react";
import { UserWithLoyalty } from "@/types/user";

interface UsersTableProps {
  loading: boolean;
  error: string | null;
  users: UserWithLoyalty[];
  searchQuery: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onEditUser: (userId: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  loading,
  error,
  users,
  searchQuery,
  sortField,
  sortDirection,
  onSort,
  onEditUser
}) => {
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

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8 h-[200px]">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
            <span className="text-muted-foreground">Loading users...</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8 h-[200px]">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Failed to load users</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (filteredUsers.length === 0) {
    return (
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
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => onSort("email")}>
              Email {renderSortIcon("email")}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => onSort("created_at")}>
              Joined {renderSortIcon("created_at")}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => onSort("last_sign_in_at")}>
              Last Login {renderSortIcon("last_sign_in_at")}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => onSort("points_balance")}>
              Points Balance {renderSortIcon("points_balance")}
            </Button>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.map((user) => (
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
                onClick={() => onEditUser(user.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

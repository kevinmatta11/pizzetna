
import React from "react";
import { Search, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import UsersTable from "@/components/admin/UsersTable";
import PointsAdjustmentDialog from "@/components/admin/PointsAdjustmentDialog";
import { useUsersManagement } from "@/hooks/admin/useUsersManagement";

const AdminUsers = () => {
  const {
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
  } = useUsersManagement();

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
        <UsersTable
          loading={loading}
          error={error}
          users={users}
          searchQuery={searchQuery}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEditUser={handleEditUser}
        />
      </div>

      {/* Adjust Points Dialog */}
      <PointsAdjustmentDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        user={users.find(u => u.id === editingUser)}
        pointsAdjustment={pointsAdjustment}
        setPointsAdjustment={setPointsAdjustment}
        adjustmentReason={adjustmentReason}
        setAdjustmentReason={setAdjustmentReason}
        onSubmit={handleAdjustPoints}
      />
    </div>
  );
};

export default AdminUsers;

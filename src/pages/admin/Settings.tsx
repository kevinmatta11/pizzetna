
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      // First sign in to verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin account settings
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View your admin account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Email</h3>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">User ID</h3>
                <p className="text-sm text-muted-foreground mt-1">{user?.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Role</h3>
                <p className="text-sm text-muted-foreground mt-1">Admin</p>
              </div>
              {user?.app_metadata?.provider && (
                <div>
                  <h3 className="text-sm font-medium">Login Provider</h3>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{user.app_metadata.provider}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Update Password */}
        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>
              Change your admin account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="password-form" onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="current-password" className="text-sm font-medium">
                  Current Password
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm New Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              form="password-form"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

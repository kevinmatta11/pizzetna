
import React from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserWithLoyalty } from "@/types/user";

interface PointsAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithLoyalty | undefined;
  pointsAdjustment: number;
  setPointsAdjustment: (points: number) => void;
  adjustmentReason: string;
  setAdjustmentReason: (reason: string) => void;
  onSubmit: () => Promise<void>;
}

const PointsAdjustmentDialog: React.FC<PointsAdjustmentDialogProps> = ({
  open,
  onOpenChange,
  user,
  pointsAdjustment,
  setPointsAdjustment,
  adjustmentReason,
  setAdjustmentReason,
  onSubmit,
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Loyalty Points</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium">User</label>
            <p className="mt-1">{user.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Current Balance</label>
            <p className="text-xl font-bold">
              {user.points_balance || 0} points
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
            onClick={onSubmit}
            disabled={!pointsAdjustment || !adjustmentReason}
          >
            {pointsAdjustment > 0 ? "Add Points" : "Deduct Points"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PointsAdjustmentDialog;

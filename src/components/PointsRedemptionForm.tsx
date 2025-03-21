
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { loyaltyService } from '@/services/loyaltyService';
import { useAuth } from '@/contexts/AuthContext';
import { Coin } from 'lucide-react';

interface PointsRedemptionFormProps {
  totalAmount: number;
  onPointsApplied: (pointsApplied: number, discountAmount: number) => void;
}

export const PointsRedemptionForm: React.FC<PointsRedemptionFormProps> = ({
  totalAmount,
  onPointsApplied
}) => {
  const { user } = useAuth();
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  
  useEffect(() => {
    const fetchPointsBalance = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const balance = await loyaltyService.getPointsBalance();
        setPointsBalance(balance);
      } catch (error) {
        console.error("Error fetching points balance:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPointsBalance();
  }, [user]);
  
  // Calculate maximum points that can be used
  // Don't allow using more points than the total order amount
  const maxPointsToUse = Math.min(
    pointsBalance,
    Math.floor(totalAmount * 100) // Convert dollars to points
  );
  
  // Calculate discount amount
  const discountAmount = pointsToUse / 100; // 100 points = $1
  
  const handleToggleUsePoints = () => {
    if (!usePoints) {
      setUsePoints(true);
      // Start with 0 points selected
      setPointsToUse(0);
    } else {
      setUsePoints(false);
      setPointsToUse(0);
      // Call with 0 to reset any applied discount
      onPointsApplied(0, 0);
    }
  };
  
  const handleApplyPoints = () => {
    onPointsApplied(pointsToUse, discountAmount);
  };
  
  const handlePointsChange = (points: number[]) => {
    setPointsToUse(points[0]);
  };
  
  if (isLoading) {
    return <div>Loading points balance...</div>;
  }
  
  if (pointsBalance === 0) {
    return (
      <div className="p-4 bg-brunch-50 rounded-md">
        <p className="text-sm text-brunch-600 flex items-center">
          <Coin className="h-4 w-4 mr-2 text-brunch-400" />
          You don't have any loyalty points to redeem yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Loyalty Points</h4>
          <p className="text-xs text-brunch-500">You have {pointsBalance} points (${(pointsBalance / 100).toFixed(2)} value)</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleToggleUsePoints}
        >
          {usePoints ? "Cancel" : "Use Points"}
        </Button>
      </div>
      
      {usePoints && (
        <div className="p-4 bg-brunch-50 rounded-md space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Points to use:</label>
              <span className="text-sm font-bold">{pointsToUse} points</span>
            </div>
            <Slider
              value={[pointsToUse]}
              max={maxPointsToUse}
              step={50}
              onValueChange={handlePointsChange}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-brunch-500">
              <span>0</span>
              <span>{maxPointsToUse}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Discount amount:</span>
            <span className="text-green-600">${discountAmount.toFixed(2)}</span>
          </div>
          
          <Button 
            onClick={handleApplyPoints}
            className="w-full bg-brunch-500 hover:bg-brunch-600"
            disabled={pointsToUse === 0}
          >
            Apply {pointsToUse} Points
          </Button>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { loyaltyService } from '@/services/loyaltyService';
import { SpinningWheel } from '@/components/SpinningWheel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const SpinWheel = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [hasSpin, setHasSpin] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    const checkSpinAvailability = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const [pendingSpin, spunToday] = await Promise.all([
          loyaltyService.checkPendingSpin(),
          loyaltyService.hasSpunToday()
        ]);
        
        setHasSpin(pendingSpin);
        setHasSpunToday(spunToday);
        
        // If user has no spin available and didn't come from an order, redirect them
        if (!pendingSpin && !spunToday) {
          toast.error("You don't have any spins available. Place an order to earn a spin!");
          navigate('/loyalty');
        }
      } catch (error) {
        console.error("Error checking spin availability:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSpinAvailability();
  }, [user, navigate]);
  
  const handleSpinComplete = () => {
    // Refresh spin availability after completion
    setHasSpin(false);
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/loyalty')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Loyalty Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-brunch-800 mb-6">
            Spin to Win Rewards
          </h1>
          
          {hasSpunToday && !hasSpin ? (
            <Alert className="mb-8 bg-amber-50 border-amber-200">
              <InfoIcon className="h-4 w-4 text-amber-500" />
              <AlertTitle>You've already spun today!</AlertTitle>
              <AlertDescription>
                You can spin the wheel once per day. Place another order to earn another spin!
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Try Your Luck!</CardTitle>
                <CardDescription>
                  Spin the wheel to win up to 300 loyalty points
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SpinningWheel 
                  onComplete={handleSpinComplete} 
                  hasSpinAvailable={hasSpin}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SpinWheel;

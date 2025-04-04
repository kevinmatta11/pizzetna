import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loyaltyService, LoyaltyTransaction } from '@/services/loyaltyService';
import { LoyaltyTransactionHistory } from '@/components/LoyaltyTransactionHistory';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Coins, History, Trophy, InfoIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const LoyaltyPoints = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPendingSpin, setHasPendingSpin] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [balance, history, spinAvailable] = await Promise.all([
        loyaltyService.getPointsBalance(),
        loyaltyService.getTransactionHistory(),
        loyaltyService.checkPendingSpin()
      ]);
      
      setPointsBalance(balance);
      setTransactions(history);
      setHasPendingSpin(spinAvailable);
    } catch (error) {
      console.error("Error loading loyalty data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  const handleSpinClick = () => {
    navigate('/spin');
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to auth
  }
  
  const dollarAmount = (pointsBalance / 100).toFixed(2);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-brunch-800 mb-6 flex items-center">
            <Trophy className="h-8 w-8 mr-2 text-brunch-500" />
            Loyalty Rewards
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-brunch-500" />
                  Your Points Balance
                </CardTitle>
                <CardDescription>
                  Use your points for discounts on future orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center p-4 bg-brunch-50 rounded-lg">
                  <p className="text-4xl font-bold text-brunch-700">{pointsBalance}</p>
                  <p className="text-sm text-brunch-500 mt-1">Worth ${dollarAmount}</p>
                  <p className="text-xs text-brunch-400 mt-4">100 points = $1.00</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-pizzetna-500" />
                  Spin to Win
                </CardTitle>
                <CardDescription>
                  Spin the wheel after placing an order to win points
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasPendingSpin ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-green-600 font-medium flex items-center mb-4">
                      <InfoIcon className="h-4 w-4 mr-1" />
                      You have a spin available!
                    </p>
                    <Button 
                      onClick={handleSpinClick}
                      className="bg-pizzetna-500 hover:bg-pizzetna-600 text-white"
                    >
                      Go to Spin Wheel
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-pizzetna-500 mb-4">
                      Place an order to earn a spin!
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/menu')}
                    >
                      View Menu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Alert className="mb-8 bg-brunch-50 border-brunch-200">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              Earn loyalty points by spinning the wheel after each order. Redeem your points for discounts on future orders at a rate of 100 points = $1.00.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Points History
              </CardTitle>
              <CardDescription>
                View your loyalty points earned and redeemed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoyaltyTransactionHistory 
                transactions={transactions}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoyaltyPoints;

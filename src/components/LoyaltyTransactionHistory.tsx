
import React from 'react';
import { LoyaltyTransaction } from '@/services/loyaltyService';
import { formatDistanceToNow } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Coin, ArrowUp, ArrowDown } from 'lucide-react';

interface LoyaltyTransactionHistoryProps {
  transactions: LoyaltyTransaction[];
  isLoading: boolean;
}

export const LoyaltyTransactionHistory: React.FC<LoyaltyTransactionHistoryProps> = ({
  transactions,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <p>Loading transaction history...</p>
      </div>
    );
  }
  
  if (!transactions.length) {
    return (
      <div className="p-8 text-center">
        <Coin className="h-12 w-12 text-brunch-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-brunch-700 mb-2">No transaction history</h3>
        <p className="text-sm text-brunch-500">Complete an order to start earning points!</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableCaption>Your loyalty points transaction history</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">
              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell>{transaction.description || 'Transaction'}</TableCell>
            <TableCell className="text-right">
              <span className={`flex items-center justify-end font-semibold ${
                transaction.transaction_type === 'earned' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.transaction_type === 'earned' ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {transaction.amount}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

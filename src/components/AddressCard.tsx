
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Home } from "lucide-react";

type Address = {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
};

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  return (
    <Card className={`relative ${address.is_default ? 'border-brunch-500 bg-brunch-50/20' : ''}`}>
      {address.is_default && (
        <div className="absolute -top-2 -right-2 bg-brunch-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
          <Home className="w-3 h-3 mr-1" />
          Default
        </div>
      )}
      <CardContent className="pt-6">
        <div className="space-y-1">
          <h3 className="font-medium text-lg">{address.full_name}</h3>
          <p className="text-sm text-muted-foreground">{address.address_line1}</p>
          {address.address_line2 && (
            <p className="text-sm text-muted-foreground">{address.address_line2}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {address.city}, {address.state} {address.postal_code}
          </p>
          <p className="text-sm text-muted-foreground">{address.country}</p>
          {address.phone && (
            <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-0">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
        {!address.is_default && (
          <Button size="sm" variant="secondary" onClick={onSetDefault}>
            Set as Default
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AddressCard;

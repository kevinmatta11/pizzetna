
export type UserWithLoyalty = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  points_balance: number;
  profile?: any;
};

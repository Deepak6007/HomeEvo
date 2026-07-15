export interface VendorStats {
  monthlyEarnings: number;
  totalEarnings: number;
  activeProjects: number;
  bidWinRate: number;
  avgRating: number;
  reviewCount: number;
  pendingPayments: number;
  escrowBalance: number;
}

export interface EarningsByMonth {
  month: string;
  amount: number;
}

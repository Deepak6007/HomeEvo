export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  category: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  location: string;
  portfolioPhotos: string[];
  priceRange: string;
  isAvailable?: boolean;
  aadhaar?: string;
  gstin?: string;
  description?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  newLeadsNotification?: boolean;
  bidUpdatesNotification?: boolean;
  paymentAlertsNotification?: boolean;
  weeklyReportNotification?: boolean;
}

export interface VendorFilter {
  category?: string;
  location?: string;
  rating?: number;
  verified?: boolean;
}

export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface VendorProjectBid {
  id: string;
  vendorId: string;
  vendorName: string;
  projectId: string;
  amount: number;
  proposal: string;
  duration: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface BidMilestone {
  title: string;
  amount: number;
  deliverable: string;
  timeline: string;
}

export interface Lead {
  id: string;
  title: string;
  clientName: string;
  category: string;
  location: string;
  budgetRange: string;
  description: string;
  postedAt: string;
  bidCount: number;
  status: 'new' | 'bidding' | 'closed';
}

export interface Bid {
  id: string;
  leadId: string;
  vendorId: string;
  amount: number;
  timeline: string;
  description: string;
  milestones: BidMilestone[];
  status: 'pending' | 'accepted' | 'rejected';
}

export interface CreateBidPayload {
  amount: number;
  timeline: string;
  description: string;
  milestones: BidMilestone[];
}

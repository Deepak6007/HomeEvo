export interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  projectId: string;
  milestoneId?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface EscrowBalance {
  total: number;
  released: number;
  pending: number;
  upcoming: number;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

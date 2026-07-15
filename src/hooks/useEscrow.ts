import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
import { queryKeys } from "./queryKeys";

export function useEscrowBalance() {
  return useQuery({
    queryKey: queryKeys.escrow.balance(),
    queryFn: () => paymentsApi.getEscrowBalance(),
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

export function usePaymentHistory(filters?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: queryKeys.escrow.history(filters),
    queryFn: () => paymentsApi.getHistory(filters),
  });
}

export function useInitiateEscrow() {
  return useMutation({
    mutationFn: ({
      projectId,
      milestoneId,
      amount,
    }: {
      projectId: string;
      milestoneId: string;
      amount: number;
    }) => paymentsApi.initiateEscrow(projectId, milestoneId, amount),
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      paymentId,
      signature,
    }: {
      orderId: string;
      paymentId: string;
      signature: string;
    }) => paymentsApi.confirmPayment(orderId, paymentId, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.escrow.all,
      });
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });
    },
  });
}

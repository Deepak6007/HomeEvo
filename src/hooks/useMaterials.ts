import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialsApi } from "@/lib/api/materials";
import { queryKeys } from "./queryKeys";

export function useMaterials(filters?: { category?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.materials.list(filters),
    queryFn: () => materialsApi.list(filters),
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: queryKeys.materials.detail(id),
    queryFn: () => materialsApi.get(id),
    enabled: !!id,
  });
}

export function useCart() {
  return useQuery({
    queryKey: queryKeys.materials.cart(),
    queryFn: () => materialsApi.getCart(),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      materialsApi.addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.materials.cart(),
      });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      items,
      deliveryAddress,
    }: {
      items: { productId: string; quantity: number }[];
      deliveryAddress: string;
    }) => materialsApi.checkout(items, deliveryAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.materials.cart(),
      });
    },
  });
}

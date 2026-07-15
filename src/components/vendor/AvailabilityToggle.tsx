"use client";

import * as React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { vendorProfileApi } from "@/lib/api/vendorProfile";
import { useVendorProfile } from "@/hooks";
import { queryKeys } from "@/hooks/queryKeys";
import { cn } from "@/lib/utils/cn";

export const AvailabilityToggle: React.FC = () => {
  const queryClient = useQueryClient();
  const { data } = useVendorProfile();

  // Extract isAvailable from the profile payload (which is structured as { profile: Vendor, completionPercentage: number })
  const isAvailable = data?.profile?.isAvailable ?? true;

  const mutation = useMutation({
    mutationFn: (newStatus: boolean) =>
      vendorProfileApi.update({ isAvailable: newStatus }),
    // Optimistic Update
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vendorProfile.detail() });
      const previousProfile = queryClient.getQueryData(queryKeys.vendorProfile.detail());

      if (previousProfile) {
        queryClient.setQueryData(queryKeys.vendorProfile.detail(), (old: any) => ({
          ...old,
          profile: {
            ...old.profile,
            isAvailable: newStatus,
          },
        }));
      }

      return { previousProfile };
    },
    onError: (err, newStatus, context: any) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.vendorProfile.detail(),
          context.previousProfile
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProfile.all });
    },
  });

  const handleToggle = () => {
    mutation.mutate(!isAvailable);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={mutation.isPending}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-2xs font-mono font-bold tracking-wider transition-all duration-300 select-none",
        isAvailable
          ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {isAvailable && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            isAvailable ? "bg-green-400" : "bg-neutral-600"
          )}
        />
      </span>
      <span>{isAvailable ? "AVAILABLE" : "OFFLINE"}</span>
    </button>
  );
};

export default AvailabilityToggle;

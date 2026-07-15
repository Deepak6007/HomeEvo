import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";
import { queryKeys } from "@/hooks/queryKeys";
import VendorMessagesContainer from "./VendorMessagesContainer";

export const metadata = {
  title: "Inbox - HomeEvo Vendor",
  description: "Chat with clients and manage lead updates in real-time.",
};

export default async function VendorMessagesPage() {
  const queryClient = new QueryClient();

  // Prefetch vendor conversations in parallel on the server
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.messages.conversations(),
      queryFn: () => messagesApi.getConversations(),
    });
  } catch (error) {
    console.error("Failed to prefetch conversations on server", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VendorMessagesContainer />
    </HydrationBoundary>
  );
}

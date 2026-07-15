import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";
import { queryKeys } from "@/hooks/queryKeys";
import ClientMessagesContainer from "./ClientMessagesContainer";

export const metadata = {
  title: "Messages - HomeEvo",
  description: "Chat with verified contractors and track project updates in real-time.",
};

export default async function ClientMessagesPage() {
  const queryClient = new QueryClient();

  // Prefetch client conversations in parallel on the server
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
      <ClientMessagesContainer />
    </HydrationBoundary>
  );
}

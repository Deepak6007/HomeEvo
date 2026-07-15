import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";
import { Conversation, Message, ApiResponse } from "@/types";
import { queryKeys } from "./queryKeys";
import { useAuth } from "./useAuth";
import { useRealtime } from "./useRealtime";

/**
 * Hook to retrieve all conversations for the user.
 * Automatically listens for NEW_MESSAGE real-time events to invalidate the cache.
 */
export function useConversations() {
  const queryClient = useQueryClient();

  useRealtime("NEW_MESSAGE", (message: Message) => {
    // Refetch conversations list
    queryClient.invalidateQueries({
      queryKey: queryKeys.messages.conversations(),
    });
    // Refetch the active thread if this message is in it
    queryClient.invalidateQueries({
      queryKey: queryKeys.messages.thread(message.conversationId),
    });
  });

  return useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: () => messagesApi.getConversations(),
  });
}

/**
 * Hook to retrieve messages for a specific conversation using cursor-based infinite queries.
 */
export function useMessages(conversationId: string) {
  return useInfiniteQuery<ApiResponse<Message[]>, Error>({
    queryKey: queryKeys.messages.thread(conversationId),
    queryFn: ({ pageParam }) =>
      messagesApi.getMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const messages = lastPage.data || [];
      if (messages.length === 0) return undefined;
      // Return the oldest message ID as the cursor for older messages
      return messages[messages.length - 1]?.id;
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook to send messages with a detailed optimistic update.
 * Pre-emptively updates both the active message thread and the conversation lists.
 * Reverts to previous snapshots on network failures.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      type = "text",
      fileUrl,
    }: {
      conversationId: string;
      content: string;
      type?: "text" | "file";
      fileUrl?: string;
    }) => messagesApi.send(conversationId, content, type, fileUrl),
    onMutate: async (variables) => {
      const { conversationId, content, type = "text", fileUrl } = variables;

      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.thread(conversationId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.conversations(),
      });

      // Snapshot caches
      const previousMessages = queryClient.getQueryData(
        queryKeys.messages.thread(conversationId)
      );
      const previousConversations = queryClient.getQueryData<ApiResponse<Conversation[]>>(
        queryKeys.messages.conversations()
      );

      // Create optimistic message
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: user?.id || "temp-sender-id",
        senderRole: (user?.role as "client" | "vendor" | "admin") || "client",
        content,
        type,
        fileUrl,
        read: false,
        createdAt: new Date().toISOString(),
      };

      // 1. Update the message thread query cache
      queryClient.setQueryData<InfiniteData<ApiResponse<Message[]>>>(
        queryKeys.messages.thread(conversationId),
        (old) => {
          if (!old) {
            return {
              pages: [{ success: true, data: [optimisticMsg], message: "Success" }],
              pageParams: [undefined],
            };
          }
          const pages = [...old.pages];
          if (pages.length > 0) {
            pages[0] = {
              ...pages[0],
              data: [optimisticMsg, ...pages[0].data],
            };
          }
          return {
            ...old,
            pages,
          };
        }
      );

      // 2. Update the conversations list query cache
      if (previousConversations?.data) {
        const updatedConversations = previousConversations.data.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: type === "file" ? "📎 File attachment" : content,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        });

        // Re-sort conversation previews (most recently updated first)
        updatedConversations.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        queryClient.setQueryData<ApiResponse<Conversation[]>>(
          queryKeys.messages.conversations(),
          {
            ...previousConversations,
            data: updatedConversations,
          }
        );
      }

      return { previousMessages, previousConversations, conversationId };
    },
    onError: (err, variables, context) => {
      if (context) {
        // Rollback message thread and conversations cache to original state
        queryClient.setQueryData(
          queryKeys.messages.thread(context.conversationId),
          context.previousMessages
        );
        queryClient.setQueryData(
          queryKeys.messages.conversations(),
          context.previousConversations
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Invalidate to synchronize client state with server
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.thread(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      });
    },
  });
}

/**
 * Hook to mark conversation messages as read when focusing a chat window.
 */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagesApi.markRead(conversationId),
    onSuccess: (data, conversationId) => {
      // Invalidate conversations list so unread badges decrement
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      });
    },
  });
}

/**
 * Hook to start a conversation with a specific recipient.
 */
export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipientId, projectId }: { recipientId: string; projectId?: string }) =>
      messagesApi.startConversation(recipientId, projectId),
    onSuccess: (data) => {
      // Invalidate conversations list so the new chat shows up immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      });
    },
  });
}

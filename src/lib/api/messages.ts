import apiClient from "./client";
import { Conversation, Message, ApiResponse } from "@/types";

export const messagesApi = {
  /**
   * Fetch all conversations for the current authenticated user
   */
  getConversations: async (): Promise<ApiResponse<Conversation[]>> => {
    const response = await apiClient.get<ApiResponse<Conversation[]>>("/messages/conversations");
    return response.data;
  },

  /**
   * Fetch messages for a specific conversation with cursor-based pagination
   */
  getMessages: async (conversationId: string, cursor?: string): Promise<ApiResponse<Message[]>> => {
    const response = await apiClient.get<ApiResponse<Message[]>>(
      `/messages/conversations/${conversationId}`,
      {
        params: { cursor },
      }
    );
    return response.data;
  },

  /**
   * Send a new message inside a conversation
   */
  send: async (
    conversationId: string,
    content: string,
    type: "text" | "file" = "text",
    fileUrl?: string
  ): Promise<Message> => {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/messages/conversations/${conversationId}`,
      {
        content,
        type,
        fileUrl,
      }
    );
    return response.data.data;
  },

  /**
   * Mark all messages in a conversation as read
   */
  markRead: async (conversationId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/messages/conversations/${conversationId}/read`
    );
    return response.data;
  },

  /**
   * Start a new conversation with a recipient (e.g. client starting with a contractor)
   */
  startConversation: async (recipientId: string, projectId?: string): Promise<Conversation> => {
    const response = await apiClient.post<ApiResponse<Conversation>>("/messages/conversations", {
      recipientId,
      projectId,
    });
    return response.data.data;
  },

  /**
   * Upload an image or PDF attachment for messaging
   */
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        "/messages/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data.url;
    } catch (error) {
      console.warn("[Messages API] Upload failed, returning local object URL for demo", error);
      // Fallback for development if API is offline or not implemented
      return URL.createObjectURL(file);
    }
  },
};

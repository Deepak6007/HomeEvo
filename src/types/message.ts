import { User } from "./auth";

export interface Conversation {
  id: string;
  clientId: string;
  vendorId: string;
  projectId?: string;
  lastMessage?: string;
  unreadCount: number;
  updatedAt: string;

  // Rich metadata populated for UI rendering
  client?: User;
  vendor?: User;
  project?: {
    id: string;
    title: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "client" | "vendor" | "admin";
  content: string;
  type: "text" | "file";
  fileUrl?: string;
  read: boolean;
  createdAt: string;
}

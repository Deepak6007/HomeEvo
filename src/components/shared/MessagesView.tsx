"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Send,
  Paperclip,
  FileText,
  Download,
  ArrowLeft,
  Loader2,
  Check,
  CheckCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkRead,
  useStartConversation,
} from "@/hooks/useMessages";
import { Conversation, Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/shared/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { vendorsApi } from "@/lib/api/vendors";
import { projectsApi } from "@/lib/api/projects";
import { toast } from "sonner";

interface MessagesViewProps {
  role: "client" | "vendor";
}

// -------------------------------------------------------------
// Development Fallbacks & Mocking
// -------------------------------------------------------------
const MOCK_VENDORS = [
  { id: "vendor-101", name: "Ramana Reddy", category: "General Contractor" },
  { id: "vendor-102", name: "Srinivas Rao", category: "Architect" },
  { id: "vendor-103", name: "Krishna Mohan", category: "Masonry Specialist" },
  { id: "vendor-104", name: "Bala Subramanyam", category: "Electrical Contractor" },
];

const MOCK_CLIENTS = [
  { id: "client-201", name: "Anil Kumar", projectTitle: "Reddy Renovation Guntur" },
  { id: "client-202", name: "Subba Rao", projectTitle: "Vijayawada Villa" },
  { id: "client-203", name: "Rajesh Sekhar", projectTitle: "Nellore Commercial Center" },
];

export const MessagesView: React.FC<MessagesViewProps> = ({ role }) => {
  const { user } = useAuth();
  const queryClient = React.useRef<any>(null);

  // Queries & Mutations
  const { data: conversationsData, isLoading: isConversationsLoading } = useConversations();
  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkRead();
  const startConvMutation = useStartConversation();

  // Local Component States
  const [activeConvId, setActiveConvId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [textInput, setTextInput] = React.useState("");
  const [isNewChatOpen, setIsNewChatOpen] = React.useState(false);
  const [recipientSearch, setRecipientSearch] = React.useState("");
  const [recipients, setRecipients] = React.useState<any[]>([]);
  const [isRecipientsLoading, setIsRecipientsLoading] = React.useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // References for UI behaviors
  const messageEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Local Mock State for Sandbox/Demo Mode when backend is offline
  const [localConversations, setLocalConversations] = React.useState<Conversation[]>([]);
  const [localMessages, setLocalMessages] = React.useState<{ [key: string]: Message[] }>({});
  const [isDemoMode, setIsDemoMode] = React.useState(false);

  // Styling maps based on roles
  const theme = {
    client: {
      bg: "bg-[#FDF8F2] text-[#3D2B1F]",
      sidebarBg: "bg-white",
      activeItem: "bg-[#FDF8F2] border-l-4 border-[#E85D04]",
      bubbleSent: "bg-[#E85D04] text-white",
      bubbleReceived: "bg-[#F7EFE4] text-[#3D2B1F] border border-[#ECDCC9]/50",
      fontHeader: "font-serif",
      fontBody: "font-body text-sm",
      containerBorder: "border-[#F5ECE2]",
      badge: "bg-[#E85D04] text-white",
      unreadText: "text-[#E85D04] font-semibold",
    },
    vendor: {
      bg: "bg-[#0C0D0F] text-white/90",
      sidebarBg: "bg-[#111315]",
      activeItem: "bg-[#1E2226] border-l-4 border-[#E85D04]",
      bubbleSent: "bg-[#E85D04] text-white",
      bubbleReceived: "bg-[#1E2226] text-white/90 border border-[#2A2E32]",
      fontHeader: "font-industrial tracking-wide uppercase",
      fontBody: "font-mono text-xs",
      containerBorder: "border-[#1E2226]",
      badge: "bg-[#E85D04] text-white",
      unreadText: "text-orange font-semibold",
    },
  }[role];

  // Fetch paginated messages for active conversation from react-query
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading,
  } = useMessages(isDemoMode || !activeConvId || activeConvId.startsWith("mock-") ? "" : activeConvId);

  // -------------------------------------------------------------
  // Load initial conversations & Fallback Mock Data Setup
  // -------------------------------------------------------------
  React.useEffect(() => {
    const apiConvs = conversationsData?.data || [];
    if (apiConvs.length > 0) {
      setLocalConversations(apiConvs);
      setIsDemoMode(false);
    } else if (!isConversationsLoading) {
      // Setup Initial Mock Data for visual demonstration
      setIsDemoMode(true);
      const isClient = role === "client";
      const initialMockConvs: Conversation[] = [
        {
          id: "mock-1",
          clientId: isClient ? user?.id || "client-1" : "client-201",
          vendorId: isClient ? "vendor-101" : user?.id || "vendor-1",
          unreadCount: 2,
          updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          lastMessage: "Hi, I have uploaded the updated structural blueprints.",
          vendor: {
            id: "vendor-101",
            name: "Ramana Reddy",
            email: "ramana.reddy@gmail.com",
            role: "vendor",
          },
          client: {
            id: "client-201",
            name: "Anil Kumar",
            email: "anil.k@gmail.com",
            role: "client",
          },
          project: {
            id: "proj-101",
            title: "Reddy Renovation Guntur",
          },
        },
        {
          id: "mock-2",
          clientId: isClient ? user?.id || "client-1" : "client-202",
          vendorId: isClient ? "vendor-102" : user?.id || "vendor-1",
          unreadCount: 0,
          updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          lastMessage: "Sure, let's meet tomorrow at 10 AM on site.",
          vendor: {
            id: "vendor-102",
            name: "Srinivas Rao",
            email: "srinivas.rao@architect.in",
            role: "vendor",
          },
          client: {
            id: "client-202",
            name: "Subba Rao",
            email: "subba.r@gmail.com",
            role: "client",
          },
          project: {
            id: "proj-102",
            title: "Vijayawada Villa Foundation",
          },
        },
      ];
      setLocalConversations(initialMockConvs);

      // Populate mock messages
      setLocalMessages({
        "mock-1": [
          {
            id: "m1",
            conversationId: "mock-1",
            senderId: isClient ? "vendor-101" : user?.id || "vendor-1",
            senderRole: "vendor",
            content: "Hello Anil! The structural drawings for the Guntur site have been finalized.",
            type: "text",
            read: true,
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
          {
            id: "m2",
            conversationId: "mock-1",
            senderId: isClient ? user?.id || "client-1" : "client-201",
            senderRole: "client",
            content: "Awesome! Can you send over the dispatch invoice as well?",
            type: "text",
            read: true,
            createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          },
          {
            id: "m3",
            conversationId: "mock-1",
            senderId: isClient ? "vendor-101" : user?.id || "vendor-1",
            senderRole: "vendor",
            content: "Here is the blueprint PDF.",
            type: "file",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            read: true,
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: "m4",
            conversationId: "mock-1",
            senderId: isClient ? "vendor-101" : user?.id || "vendor-1",
            senderRole: "vendor",
            content: "Hi, I have uploaded the updated structural blueprints.",
            type: "text",
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
        ],
        "mock-2": [
          {
            id: "m2-1",
            conversationId: "mock-2",
            senderId: isClient ? user?.id || "client-1" : "client-202",
            senderRole: "client",
            content: "Hi Srinivas, can we review the masonry layout tomorrow?",
            type: "text",
            read: true,
            createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          },
          {
            id: "m2-2",
            conversationId: "mock-2",
            senderId: isClient ? "vendor-102" : user?.id || "vendor-1",
            senderRole: "vendor",
            content: "Sure, let's meet tomorrow at 10 AM on site.",
            type: "text",
            read: true,
            createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          },
        ],
      });
    }
  }, [conversationsData, isConversationsLoading, role, user]);

  // Sync scroll on conversation select or new message addition
  const scrollChatToBottom = (behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  };

  React.useEffect(() => {
    if (activeConvId) {
      scrollChatToBottom("auto");
      // Trigger API mark read
      if (!isDemoMode && !activeConvId.startsWith("mock-")) {
        markReadMutation.mutate(activeConvId);
      } else {
        // Decrease unread in local mock
        setLocalConversations((prev) =>
          prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c))
        );
      }
    }
  }, [activeConvId]);

  // -------------------------------------------------------------
  // Multiline Textarea Auto-Grow
  // -------------------------------------------------------------
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [textInput]);

  // -------------------------------------------------------------
  // Recipient Loader for New Messages Modal
  // -------------------------------------------------------------
  const loadRecipients = async () => {
    setIsRecipientsLoading(true);
    try {
      if (role === "client") {
        // Fetch verified vendors using API
        const response = await vendorsApi.list({ verified: true }, 1);
        if (response.data && response.data.length > 0) {
          setRecipients(response.data);
        } else {
          setRecipients(MOCK_VENDORS);
        }
      } else {
        // Fetch active projects to identify clients
        const response = await projectsApi.list({ status: "active" });
        if (response.data && response.data.length > 0) {
          const clientsList = response.data.map((proj) => ({
            id: proj.clientId,
            name: `Client - Project ${proj.title}`,
            projectTitle: proj.title,
          }));
          setRecipients(clientsList);
        } else {
          setRecipients(MOCK_CLIENTS);
        }
      }
    } catch (e) {
      // Network failure triggers mocks
      setRecipients(role === "client" ? MOCK_VENDORS : MOCK_CLIENTS);
    } finally {
      setIsRecipientsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isNewChatOpen) {
      loadRecipients();
    }
  }, [isNewChatOpen]);

  // -------------------------------------------------------------
  // Computed Messaging Structures
  // -------------------------------------------------------------
  const filteredConversations = localConversations.filter((c) => {
    const otherName =
      role === "client" ? c.vendor?.name || "Vendor" : c.client?.name || "Client";
    return otherName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeConversation = localConversations.find((c) => c.id === activeConvId);

  // Retrieve current thread messages (either mock map or TanStack Query pages)
  const threadMessages = React.useMemo(() => {
    if (!activeConvId) return [];

    if (isDemoMode || activeConvId.startsWith("mock-")) {
      return localMessages[activeConvId] || [];
    }

    // Flat map paginated queries
    const pages = messagesData?.pages || [];
    const rawMessages = pages.flatMap((page) => page.data || []);
    // Reversing so oldest is rendering at top, newest at bottom
    return [...rawMessages].reverse();
  }, [activeConvId, messagesData, localMessages, isDemoMode]);

  // Grouped messages separating by Date Separators
  const groupedMessages = React.useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    threadMessages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      let key = "";
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(msg);
    });

    return Object.keys(groups).map((dateLabel) => ({
      dateLabel,
      messages: groups[dateLabel],
    }));
  }, [threadMessages]);

  const activeRecipientName = React.useMemo(() => {
    if (!activeConversation) return "Chat";
    return role === "client"
      ? activeConversation.vendor?.name || "Contractor"
      : activeConversation.client?.name || "Client";
  }, [activeConversation, role]);

  const activeRecipientInitials = React.useMemo(() => {
    const name = activeRecipientName;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [activeRecipientName]);

  // -------------------------------------------------------------
  // Action Handlers
  // -------------------------------------------------------------
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !activeConvId) return;

    const contentToSend = textInput.trim();
    setTextInput("");

    if (isDemoMode || activeConvId.startsWith("mock-")) {
      // Optimistic Mock Message Addition
      const tempId = `mock-msg-${Date.now()}`;
      const newMsg: Message = {
        id: tempId,
        conversationId: activeConvId,
        senderId: user?.id || "client-1",
        senderRole: role,
        content: contentToSend,
        type: "text",
        read: true,
        createdAt: new Date().toISOString(),
      };

      setLocalMessages((prev) => ({
        ...prev,
        [activeConvId]: [...(prev[activeConvId] || []), newMsg],
      }));

      setLocalConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: contentToSend, updatedAt: new Date().toISOString() }
            : c
        )
      );

      scrollChatToBottom();

      // Trigger automatic simulation reply (wow factor)
      setTimeout(() => {
        const replyId = `mock-reply-${Date.now()}`;
        const otherPartyName = role === "client" ? "Ramana Reddy (Contractor)" : "Anil Kumar (Client)";
        const replyMsg: Message = {
          id: replyId,
          conversationId: activeConvId,
          senderId: role === "client" ? "vendor-101" : "client-201",
          senderRole: role === "client" ? "vendor" : "client",
          content: `Hi ${user?.name || "there"}! This is an automatic response from ${otherPartyName}. I have received your request: "${contentToSend}". Let's discuss this soon.`,
          type: "text",
          read: false,
          createdAt: new Date().toISOString(),
        };

        setLocalMessages((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), replyMsg],
        }));

        setLocalConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  lastMessage: replyMsg.content,
                  unreadCount: c.unreadCount + 1,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );

        toast.info(`New message from ${activeRecipientName}`);
        scrollChatToBottom();
      }, 1500);
    } else {
      // Execute standard optimistic Query mutation
      sendMessageMutation.mutate(
        { conversationId: activeConvId, content: contentToSend },
        {
          onSuccess: () => {
            scrollChatToBottom();
          },
          onError: () => {
            toast.error("Failed to deliver message. Optimistic roll-back performed.");
          },
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Upload trigger for file messages
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0 || !activeConvId) return;
    const file = files[0];

    setIsUploading(true);
    setIsFileUploadOpen(false);

    try {
      let finalUrl = "";
      if (isDemoMode || activeConvId.startsWith("mock-")) {
        // Mock upload logic (simulates progress delay)
        await new Promise((res) => setTimeout(res, 1200));
        finalUrl = URL.createObjectURL(file);
      } else {
        // Calls the backend Cloudinary proxy
        const { messagesApi } = await import("@/lib/api/messages");
        finalUrl = await messagesApi.uploadFile(file);
      }

      if (isDemoMode || activeConvId.startsWith("mock-")) {
        const tempId = `mock-msg-${Date.now()}`;
        const newMsg: Message = {
          id: tempId,
          conversationId: activeConvId,
          senderId: user?.id || "client-1",
          senderRole: role,
          content: file.name,
          type: "file",
          fileUrl: finalUrl,
          read: true,
          createdAt: new Date().toISOString(),
        };

        setLocalMessages((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), newMsg],
        }));

        setLocalConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  lastMessage: `📎 File: ${file.name}`,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );

        scrollChatToBottom();
        toast.success("File attached and delivered!");
      } else {
        sendMessageMutation.mutate({
          conversationId: activeConvId,
          content: file.name,
          type: "file",
          fileUrl: finalUrl,
        });
        scrollChatToBottom();
      }
    } catch (e) {
      toast.error("Failed to upload file attachment.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartNewChat = async (recipient: any) => {
    setIsNewChatOpen(false);

    if (isDemoMode) {
      // Create local mock conversation wrapper
      const newConvId = `mock-conv-${Date.now()}`;
      const newMockConv: Conversation = {
        id: newConvId,
        clientId: role === "client" ? user?.id || "client-1" : recipient.id,
        vendorId: role === "client" ? recipient.id : user?.id || "vendor-1",
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        lastMessage: "Conversation initiated.",
        vendor:
          role === "client"
            ? { id: recipient.id, name: recipient.name, email: "", role: "vendor" }
            : { id: user?.id || "vendor-1", name: user?.name || "Vendor", email: "", role: "vendor" },
        client:
          role === "client"
            ? { id: user?.id || "client-1", name: user?.name || "Client", email: "", role: "client" }
            : { id: recipient.id, name: recipient.name, email: "", role: "client" },
        project: recipient.projectTitle
          ? { id: "proj-m", title: recipient.projectTitle }
          : undefined,
      };

      setLocalConversations((prev) => [newMockConv, ...prev]);
      setLocalMessages((prev) => ({
        ...prev,
        [newConvId]: [
          {
            id: `m-init-${Date.now()}`,
            conversationId: newConvId,
            senderId: user?.id || "client-1",
            senderRole: role,
            content: "Hello! Let's start collaborating.",
            type: "text",
            read: true,
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      setActiveConvId(newConvId);
    } else {
      startConvMutation.mutate(
        { recipientId: recipient.id },
        {
          onSuccess: (newConv: any) => {
            setActiveConvId(newConv.id);
          },
          onError: () => {
            toast.error("Failed to initialize conversation on backend.");
          },
        }
      );
    }
  };

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden border shadow-sm transition-all duration-300",
        theme.bg,
        theme.containerBorder
      )}
    >
      {/* -------------------------------------------------------------
          Side Panel: Conversation Listing Panel
          ------------------------------------------------------------- */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col border-r h-full transition-all duration-300 shrink-0",
          theme.sidebarBg,
          theme.containerBorder,
          activeConvId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Title & Actions */}
        <div className="p-4 border-b shrink-0 flex items-center justify-between">
          <h2 className={cn("text-lg font-bold tracking-tight", theme.fontHeader)}>
            Messages
          </h2>
          <Button
            size="icon-xs"
            onClick={() => setIsNewChatOpen(true)}
            className="bg-orange hover:bg-orange/90 text-white rounded-full h-8 w-8 flex items-center justify-center transition-all duration-200 active:scale-90"
            title="Start new conversation"
          >
            <Plus className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Search Field */}
        <div className="p-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-lg border-muted bg-muted/20"
            />
          </div>
        </div>

        {/* Listing Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {isConversationsLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-orange" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-xs leading-relaxed">
              No conversations found.
              <br />
              Click the "+" icon to start a chat.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConvId;
              const title =
                role === "client" ? conv.vendor?.name || "Contractor" : conv.client?.name || "Client";
              const subTitle = conv.project?.title ? conv.project.title : "";
              const initials = title
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);

              const timeString = new Date(conv.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 cursor-pointer transition-all duration-200 hover:bg-muted/15 select-none",
                    isSelected ? theme.activeItem : "border-l-4 border-l-transparent"
                  )}
                >
                  <Avatar className="h-10 w-10 border border-muted bg-orange shadow-2xs">
                    <AvatarFallback className="bg-orange text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-semibold block truncate", theme.unreadText)}>
                        {title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 leading-none">
                        {timeString}
                      </span>
                    </div>

                    {subTitle && (
                      <span className="text-[10px] font-medium text-muted-foreground block truncate mt-0.5">
                        {subTitle}
                      </span>
                    )}

                    <p className="text-2xs text-muted-foreground block truncate max-w-[200px] mt-1">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span
                      className={cn(
                        "h-4 min-w-4 text-[9px] font-bold rounded-full flex items-center justify-center px-1 shrink-0 self-center leading-none mt-1 animate-pulse",
                        theme.badge
                      )}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          Right Panel: Message Feed and Chat Thread
          ------------------------------------------------------------- */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full bg-background min-w-0",
          !activeConvId ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div
              className={cn(
                "h-16 flex items-center justify-between px-4 border-b shrink-0 bg-card",
                theme.containerBorder
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden text-muted-foreground mr-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-9 w-9 border border-muted bg-orange">
                  <AvatarFallback className="bg-orange text-white text-xs font-semibold">
                    {activeRecipientInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 leading-tight">
                  <span className="text-xs font-semibold block truncate">
                    {activeRecipientName}
                  </span>
                  {activeConversation.project && (
                    <span className="text-[10px] text-muted-foreground block truncate">
                      Project: {activeConversation.project.title}
                    </span>
                  )}
                </div>
              </div>

              <a
                href={
                  role === "client"
                    ? `/client/vendors/${activeConversation.vendorId}`
                    : `/vendor/projects`
                }
                className={cn(
                  "text-2xs font-semibold text-orange hover:underline shrink-0 px-3 py-1.5 rounded-lg border border-orange/20 bg-orange/5 hover:bg-orange/10 transition-all"
                )}
              >
                View Profile
              </a>
            </div>

            {/* Message History Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isMessagesLoading ? (
                <div className="flex flex-col items-center justify-center p-8 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-orange" />
                  <span className="text-2xs text-muted-foreground">Loading message history...</span>
                </div>
              ) : (
                <>
                  {hasNextPage && (
                    <div className="flex justify-center shrink-0">
                      <Button
                        variant="ghost"
                        size="xs"
                        disabled={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                        className="text-2xs text-orange border border-orange/10"
                      >
                        {isFetchingNextPage ? "Loading..." : "Load Older Messages"}
                      </Button>
                    </div>
                  )}

                  {groupedMessages.map((group) => (
                    <div key={group.dateLabel} className="space-y-4">
                      {/* Date Separator */}
                      <div className="flex justify-center my-3 select-none">
                        <span className="text-[10px] px-3 py-1 rounded-full bg-muted/40 font-medium text-muted-foreground tracking-wide leading-none border border-border/10">
                          {group.dateLabel}
                        </span>
                      </div>

                      {group.messages.map((msg) => {
                        const isSent = msg.senderId === user?.id || msg.senderRole === role;
                        const time = new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex flex-col max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 shadow-2xs leading-relaxed transition-all duration-200 select-text",
                              isSent ? cn("ml-auto", theme.bubbleSent) : theme.bubbleReceived
                            )}
                          >
                            {/* Message Body Content */}
                            {msg.type === "file" ? (
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-black/10 flex items-center justify-center shrink-0">
                                  <FileText className="h-4.5 w-4.5 text-white/90" />
                                </div>
                                <div className="overflow-hidden min-w-0 mr-2 leading-tight">
                                  <span className="text-2xs font-semibold block truncate max-w-[150px]">
                                    {msg.content}
                                  </span>
                                  <span className="text-[9px] opacity-75">Attachment File</span>
                                </div>
                                <a
                                  href={msg.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-8 w-8 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center shrink-0 transition-colors"
                                  title="Download file"
                                >
                                  <Download className="h-4 w-4 text-white/90" />
                                </a>
                              </div>
                            ) : (
                              <p className={theme.fontBody}>{msg.content}</p>
                            )}

                            {/* Message Details footer */}
                            <div className="flex items-center gap-1.5 self-end mt-1 text-[9px] opacity-75 font-normal tracking-wide">
                              <span>{time}</span>
                              {isSent &&
                                (msg.id.startsWith("temp-") ? (
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                ) : msg.read ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </>
              )}
            </div>

            {/* Inline Upload Form Selector Drawer */}
            {isFileUploadOpen && (
              <div
                className={cn(
                  "p-4 border-t shrink-0 animate-in slide-in-from-bottom-2 duration-300",
                  theme.containerBorder
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xs font-bold tracking-wider uppercase">
                    Select File Attachment
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsFileUploadOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>
                <FileUpload
                  accept="image/*,application/pdf"
                  multiple={false}
                  onUpload={handleFileUpload}
                  label="Attach blueprint or photo"
                  description="Supports PNG, JPG, or PDF up to 10MB"
                />
              </div>
            )}

            {/* Message Sender Input Form */}
            <form
              onSubmit={handleSendMessage}
              className={cn(
                "p-3 border-t bg-card shrink-0 flex items-end gap-2.5",
                theme.containerBorder
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsFileUploadOpen((prev) => !prev)}
                className="text-muted-foreground hover:text-foreground shrink-0 h-10 w-10 border border-muted hover:bg-muted/10 rounded-xl"
                title="Attach photo/document"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="Type a message..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-3.5 pr-3 py-2.5 rounded-xl border border-muted bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange max-h-[140px] leading-relaxed transition-all"
                />
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={!textInput.trim() || isUploading}
                className="bg-orange hover:bg-orange/95 text-white shrink-0 h-10 w-10 rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center"
              >
                {isUploading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3 select-none">
            <div className="h-16 w-16 rounded-full bg-muted/40 border flex items-center justify-center shadow-2xs">
              <UserIcon className="h-8 w-8 opacity-75" />
            </div>
            <h3 className={cn("text-base font-semibold", theme.fontHeader)}>
              No active chat thread
            </h3>
            <p className="text-xs max-w-xs mx-auto leading-relaxed">
              Select an existing client or contractor conversation from the sidebar list, or start a new message chat immediately.
            </p>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          Modal Dialog: New Message Recipient Selector
          ------------------------------------------------------------- */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className={cn("sm:max-w-md rounded-2xl border", theme.bg, theme.containerBorder)}>
          <DialogHeader>
            <DialogTitle className={cn("text-base font-bold", theme.fontHeader)}>
              New Message Chat
            </DialogTitle>
            <DialogDescription className="text-2xs text-muted-foreground leading-relaxed">
              {role === "client"
                ? "Select a verified contractor or vendor to start talking."
                : "Select a client project owner to communicate details."}
            </DialogDescription>
          </DialogHeader>

          {/* Search recipient query */}
          <div className="relative my-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search profiles by name..."
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              className="pl-9 h-9 border-muted rounded-lg bg-muted/10 text-xs"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-border/40 select-none">
            {isRecipientsLoading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="h-4.5 w-4.5 animate-spin text-orange" />
                <span className="text-2xs text-muted-foreground">Loading matches...</span>
              </div>
            ) : (
              recipients
                .filter((r) => r.name.toLowerCase().includes(recipientSearch.toLowerCase()))
                .map((recipient) => {
                  const initials = recipient.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2);

                  return (
                    <div
                      key={recipient.id}
                      onClick={() => handleStartNewChat(recipient)}
                      className="flex items-center gap-3 p-3.5 hover:bg-muted/10 cursor-pointer transition-colors rounded-xl"
                    >
                      <Avatar className="h-9 w-9 border bg-orange">
                        <AvatarFallback className="bg-orange text-white text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <span className="text-xs font-bold block">{recipient.name}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          {recipient.category || recipient.projectTitle || "Profile Match"}
                        </span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesView;

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

class RealtimeManager {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // Local fallback for triggering mock real-time messages in development
      window.addEventListener("mock_realtime_event", (e: any) => {
        const { event, data } = e.detail || {};
        if (event) {
          this.emit(event, data);
        }
      });
    }
  }

  public connect(token: string) {
    if (
      this.token === token &&
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.disconnect();
    this.token = token;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000"}?token=${token}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event && payload.data) {
            this.emit(payload.event, payload.data);
          }
        } catch (err) {
          console.error("[Realtime] Failed to parse WebSocket message", err);
        }
      };

      this.socket.onerror = () => {
        console.warn("[Realtime] WebSocket connection error. Gracefully falling back to mock mode.");
      };

      this.socket.onclose = () => {
        if (this.token) {
          this.reconnectTimeout = setTimeout(() => this.connect(token), 5000);
        }
      };
    } catch (e) {
      console.warn("[Realtime] Failed to initialize WebSocket client. Using mock fallback.", e);
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.token = null;
  }

  public addListener(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public removeListener(event: string, callback: (data: any) => void) {
    const list = this.listeners.get(event);
    if (list) {
      list.delete(callback);
      if (list.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit(event: string, data: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[Realtime] Error in event listener for ${event}`, err);
        }
      });
    }
  }

  /**
   * Helper to manually trigger mock real-time updates (e.g. for development demo)
   */
  public triggerLocalMock(event: string, data: any) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mock_realtime_event", {
          detail: { event, data },
        })
      );
    }
  }
}

export const realtimeManager = new RealtimeManager();

export function useRealtime<T = any>(event: string, callback: (data: T) => void) {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken) {
      realtimeManager.connect(accessToken);
    } else {
      realtimeManager.disconnect();
    }
  }, [accessToken]);

  useEffect(() => {
    const handler = (data: T) => {
      callback(data);
    };

    realtimeManager.addListener(event, handler);
    return () => {
      realtimeManager.removeListener(event, handler);
    };
  }, [event, callback]);
}

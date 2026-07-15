import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import * as Ably from "ably";

class RealtimeManager {
  private ably: Ably.Realtime | null = null;
  private channel: any = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
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
    if (this.token === token && this.ably) {
      return;
    }

    this.disconnect();
    this.token = token;

    const ablyKey = process.env.NEXT_PUBLIC_ABLY_KEY;
    if (!ablyKey) {
      console.warn("[Realtime] NEXT_PUBLIC_ABLY_KEY is missing. Real-time updates will run in mock mode.");
      return;
    }

    try {
      // Connect to Ably Realtime
      this.ably = new Ably.Realtime({
        key: ablyKey,
        clientId: token
      });

      // Subscribe to the updates channel
      this.channel = this.ably.channels.get("homeevo-updates");
      this.channel.subscribe((message) => {
        const eventName = message.name;
        const payload = message.data;
        if (eventName && payload) {
          this.emit(eventName, payload);
        }
      });
    } catch (e) {
      console.warn("[Realtime] Failed to initialize Ably connection. Using mock fallback.", e);
    }
  }

  public disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    if (this.ably) {
      this.ably.close();
      this.ably = null;
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

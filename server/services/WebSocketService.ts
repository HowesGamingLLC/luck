import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

interface GameSubscription {
  userId: string;
  gameId: string;
  roundId: string;
}

interface GameUpdate {
  type:
    | "entry_submitted"
    | "round_status"
    | "winner_announced"
    | "payout_processed"
    | "game_created"
    | "round_cancelled";
  gameId: string;
  roundId?: string;
  data: any;
  timestamp: number;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map();
  private gameRoomSubscriptions: Map<string, Set<string>> = new Map();

  /**
   * Initialize Socket.io server
   */
  public initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.VITE_PUBLIC_URL || "http://localhost:5173",
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupConnectionHandlers();
    console.log("[WebSocket] Server initialized");

    return this.io;
  }

  /**
   * Setup connection and disconnection handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`);

      // Handle user authentication
      socket.on("authenticate", (data: { userId: string }) => {
        this.handleUserAuthentication(socket, data.userId);
      });

      // Handle game subscription
      socket.on(
        "subscribe_game",
        (data: { gameId: string; roundId?: string }) => {
          this.handleGameSubscription(socket, data.gameId, data.roundId);
        },
      );

      // Handle game unsubscription
      socket.on("unsubscribe_game", (data: { gameId: string }) => {
        this.handleGameUnsubscription(socket, data.gameId);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        this.handleUserDisconnection(socket);
      });

      // Handle errors
      socket.on("error", (error: any) => {
        console.error(`[WebSocket] Error from ${socket.id}:`, error);
      });
    });
  }

  /**
   * Authenticate user and associate socket with userId
   */
  private handleUserAuthentication(socket: Socket, userId: string): void {
    // Store user socket association
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    // Store userId on socket for later reference
    (socket as any).userId = userId;
    socket.join(`user:${userId}`);

    console.log(
      `[WebSocket] User ${userId} authenticated with socket ${socket.id}`,
    );
    socket.emit("authenticated", { userId, socketId: socket.id });
  }

  /**
   * Handle user subscribing to a game
   */
  private handleGameSubscription(
    socket: Socket,
    gameId: string,
    roundId?: string,
  ): void {
    const userId = (socket as any).userId;
    if (!userId) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    const roomKey = roundId
      ? `game:${gameId}:round:${roundId}`
      : `game:${gameId}`;
    socket.join(roomKey);

    // Track subscription
    if (!this.gameRoomSubscriptions.has(roomKey)) {
      this.gameRoomSubscriptions.set(roomKey, new Set());
    }
    this.gameRoomSubscriptions.get(roomKey)!.add(socket.id);

    console.log(`[WebSocket] User ${userId} subscribed to ${roomKey}`);
    socket.emit("game_subscribed", { gameId, roundId });
  }

  /**
   * Handle user unsubscribing from a game
   */
  private handleGameUnsubscription(socket: Socket, gameId: string): void {
    const userId = (socket as any).userId;
    if (!userId) return;

    socket.leave(`game:${gameId}`);
    // Also leave all rounds of this game
    for (const [room] of this.gameRoomSubscriptions) {
      if (room.startsWith(`game:${gameId}:`)) {
        socket.leave(room);
        const subscribers = this.gameRoomSubscriptions.get(room);
        if (subscribers) {
          subscribers.delete(socket.id);
        }
      }
    }

    console.log(`[WebSocket] User ${userId} unsubscribed from game ${gameId}`);
  }

  /**
   * Handle user disconnection
   */
  private handleUserDisconnection(socket: Socket): void {
    const userId = (socket as any).userId;
    console.log(
      `[WebSocket] User disconnected: ${socket.id}${userId ? ` (${userId})` : ""}`,
    );

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    // Clean up game subscriptions
    for (const [room, subscribers] of this.gameRoomSubscriptions) {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        this.gameRoomSubscriptions.delete(room);
      }
    }
  }

  /**
   * Broadcast a game update to all subscribed users
   */
  public broadcastGameUpdate(update: GameUpdate): void {
    if (!this.io) return;

    const roomKey = update.roundId
      ? `game:${update.gameId}:round:${update.roundId}`
      : `game:${update.gameId}`;

    this.io.to(roomKey).emit("game_update", {
      ...update,
      deliveredAt: new Date().toISOString(),
    });

    console.log(`[WebSocket] Broadcasted ${update.type} to ${roomKey}`);
  }

  /**
   * Send update to specific user
   */
  public sendUserNotification(userId: string, notification: any): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit("notification", {
      ...notification,
      deliveredAt: new Date().toISOString(),
    });

    console.log(`[WebSocket] Sent notification to user ${userId}`);
  }

  /**
   * Broadcast entry submission event
   */
  public broadcastEntrySubmitted(
    gameId: string,
    roundId: string,
    data: any,
  ): void {
    this.broadcastGameUpdate({
      type: "entry_submitted",
      gameId,
      roundId,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast round status change
   */
  public broadcastRoundStatus(
    gameId: string,
    roundId: string,
    status: string,
    entryCount: number,
    prizePool: number,
  ): void {
    this.broadcastGameUpdate({
      type: "round_status",
      gameId,
      roundId,
      data: { status, entryCount, prizePool },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast winner announcement
   */
  public broadcastWinnerAnnounced(
    gameId: string,
    roundId: string,
    winnerId: string,
    prizeAmount: number,
    prizeType: string,
  ): void {
    this.broadcastGameUpdate({
      type: "winner_announced",
      gameId,
      roundId,
      data: { winnerId, prizeAmount, prizeType },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast payout processed
   */
  public broadcastPayoutProcessed(
    userId: string,
    gameId: string,
    roundId: string,
    amount: number,
    currency: string,
  ): void {
    this.broadcastGameUpdate({
      type: "payout_processed",
      gameId,
      roundId,
      data: { userId, amount, currency },
      timestamp: Date.now(),
    });

    // Also send personal notification to user
    this.sendUserNotification(userId, {
      type: "payout_received",
      amount,
      currency,
      gameId,
    });
  }

  /**
   * Broadcast new game creation (admin event)
   */
  public broadcastGameCreated(game: any): void {
    if (!this.io) return;

    // Send to admin users
    this.io.emit("game_created", {
      game,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast round cancellation
   */
  public broadcastRoundCancelled(
    gameId: string,
    roundId: string,
    reason: string,
  ): void {
    this.broadcastGameUpdate({
      type: "round_cancelled",
      gameId,
      roundId,
      data: { reason },
      timestamp: Date.now(),
    });
  }

  /**
   * Get number of connected users
   */
  public getConnectedUserCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get active subscriptions for a game
   */
  public getGameSubscriberCount(gameId: string, roundId?: string): number {
    const roomKey = roundId
      ? `game:${gameId}:round:${roundId}`
      : `game:${gameId}`;

    const subscribers = this.gameRoomSubscriptions.get(roomKey);
    return subscribers ? subscribers.size : 0;
  }

  /**
   * Get Socket.io instance
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Shutdown the WebSocket server
   */
  public shutdown(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    this.userSockets.clear();
    this.gameRoomSubscriptions.clear();
    console.log("[WebSocket] Server shutdown");
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

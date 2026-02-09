import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getTournaments,
  getTournament,
  registerForTournament,
  unregisterFromTournament,
  getTournamentLeaderboard,
  createTournament,
  startTournament,
  cancelTournament,
} from "./routes/tournaments";
import {
  getProviders,
  getGames,
  getGameById,
  launchGame,
  validateSession,
  endSession,
  getPlayerBalance,
  getActiveSessions,
  checkProviderHealth,
  testProviders,
} from "./routes/slots";
import {
  getThumbnail,
  preloadThumbnails,
  getCacheStats,
  clearCache,
  serveThumbnail,
} from "./routes/thumbnails";
import {
  getPublicProviders,
  getPublicGames,
  getPublicGameDetails,
  getPublicGameEmbed,
  getPublicApiDocs,
  getRateLimitStatus,
} from "./routes/publicApi";

export function createServer() {
  const app = express();

  // Webhook raw body (must be before global JSON parser)
  const rawBodySaver = (req: any, _res: any, buf: any) => {
    if (buf && buf.length) req.rawBody = buf.toString();
  };
  app.use("/api/square/webhook", express.json({ verify: rawBodySaver }));
  const paymentsEarly =
    require("./routes/payments") as typeof import("./routes/payments");
  app.post("/api/square/webhook", paymentsEarly.squareWebhook);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Auth middleware - attach user from Authorization header or session
  app.use((req: any, res, next) => {
    // For now, just set a placeholder - in production, verify JWT
    const authHeader = req.headers.authorization;
    if (authHeader) {
      // Extract user from token - implement proper JWT verification
      req.user = { id: "placeholder-user-id" };
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Game routes
  const gameRoutes =
    require("./routes/games") as typeof import("./routes/games");
  app.get("/api/games", gameRoutes.getGames);
  app.get("/api/games/:gameId", gameRoutes.getGameDetails);
  app.post("/api/games", gameRoutes.createGame);
  app.post("/api/games/entries/submit", gameRoutes.submitEntry);
  app.get("/api/games/rounds/:roundId/entries", gameRoutes.getPlayerEntries);
  app.get("/api/games/rounds/:roundId/status", gameRoutes.getRoundStatus);
  app.get(
    "/api/games/:roundId/verify/:verificationCode",
    gameRoutes.verifyResult,
  );
  app.get("/api/games/history", gameRoutes.getUserGameHistory);

  // External games routes (iframe-based games)
  const externalGameRoutes =
    require("./routes/externalGames") as typeof import("./routes/externalGames");
  app.get("/api/external-games", externalGameRoutes.getExternalGames);
  app.get(
    "/api/external-games/:gameId",
    externalGameRoutes.getExternalGameById,
  );
  app.post("/api/external-games", externalGameRoutes.addExternalGame);
  app.put("/api/external-games/:gameId", externalGameRoutes.updateExternalGame);
  app.delete(
    "/api/external-games/:gameId",
    externalGameRoutes.deleteExternalGame,
  );

  // Admin game routes
  const adminGameRoutes =
    require("./routes/adminGames") as typeof import("./routes/adminGames");
  app.get(
    "/api/admin/games/dashboard",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.getDashboard,
  );
  app.put(
    "/api/admin/games/:gameId/config",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.updateGameConfig,
  );
  app.put(
    "/api/admin/games/:gameId/toggle",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.toggleGameEnabled,
  );
  app.post(
    "/api/admin/games/rounds/:roundId/pause",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.pauseRound,
  );
  app.post(
    "/api/admin/games/rounds/:roundId/cancel",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.cancelRound,
  );
  app.get(
    "/api/admin/games/rounds/:roundId/monitor",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.monitorRound,
  );
  app.post(
    "/api/admin/games/rounds/:roundId/draw",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.manualDraw,
  );
  app.post(
    "/api/admin/games/payouts/adjust",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.adjustPayout,
  );
  app.get(
    "/api/admin/games/rng/:roundId/verify",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.getRngVerification,
  );
  app.get(
    "/api/admin/audit-log",
    adminGameRoutes.requireAdmin,
    adminGameRoutes.getAdminAuditLog,
  );

  // Tournament routes
  app.get("/api/tournaments", getTournaments);
  app.get("/api/tournaments/:id", getTournament);
  app.post("/api/tournaments/:id/register", registerForTournament);
  app.post("/api/tournaments/:id/unregister", unregisterFromTournament);
  app.get("/api/tournaments/:id/leaderboard", getTournamentLeaderboard);
  app.post("/api/tournaments", createTournament);
  app.post("/api/tournaments/:id/start", startTournament);
  app.post("/api/tournaments/:id/cancel", cancelTournament);

  // Slot provider routes
  app.get("/api/slots/providers", getProviders);
  app.get("/api/slots/games", getGames);
  app.get("/api/slots/providers/:providerId/games/:gameId", getGameById);
  app.post("/api/slots/launch", launchGame);
  app.post("/api/slots/validate-session", validateSession);
  app.post("/api/slots/end-session", endSession);
  app.get(
    "/api/slots/providers/:providerId/balance/:playerId",
    getPlayerBalance,
  );
  app.get("/api/slots/admin/sessions", getActiveSessions);
  app.get("/api/slots/admin/health", checkProviderHealth);
  app.get("/api/slots/admin/test", testProviders);

  // Thumbnail routes
  app.get("/api/thumbnails", getThumbnail);
  app.post("/api/thumbnails/preload", preloadThumbnails);
  app.get("/api/thumbnails/stats", getCacheStats);
  app.delete("/api/thumbnails/cache", clearCache);
  app.get("/thumbnails/:filename", serveThumbnail);

  // Public API routes (for external access to free games)
  app.get("/api/public/docs", getPublicApiDocs);
  app.get("/api/public/providers", getPublicProviders);
  app.get("/api/public/games", getPublicGames);
  app.get("/api/public/games/:providerId/:gameId", getPublicGameDetails);
  app.get("/api/public/embed/:providerId/:gameId", getPublicGameEmbed);
  app.get("/api/public/rate-limit", getRateLimitStatus);

  // Payments and status
  const payments =
    require("./routes/payments") as typeof import("./routes/payments");
  app.get("/api/payments/packages", payments.listPackages);
  app.post("/api/payments/create", payments.createPaymentLink);
  app.get("/api/payments/orders", payments.listOrders);
  app.get("/api/payments/stats", payments.getSalesStats);
  app.get("/api/status/db", payments.dbStatus);

  // KYC routes
  const kyc = require("./routes/kyc") as typeof import("./routes/kyc");
  app.post("/api/kyc/create-upload", kyc.createKycUploadUrl);
  app.post("/api/kyc/submit", kyc.submitKyc);

  // Admin packages
  const adminPackages =
    require("./routes/adminPackages") as typeof import("./routes/adminPackages");
  app.get("/api/admin/packages", adminPackages.listAdminPackages);
  app.post("/api/admin/packages", adminPackages.createAdminPackage);
  app.put("/api/admin/packages/:id", adminPackages.updateAdminPackage);
  app.delete("/api/admin/packages/:id", adminPackages.deleteAdminPackage);

  // Leaderboard routes
  const leaderboard =
    require("./routes/leaderboard") as typeof import("./routes/leaderboard");
  app.get("/api/leaderboard", leaderboard.getLeaderboard);
  app.post("/api/leaderboard/award-weekly", leaderboard.awardWeeklyBonuses);
  leaderboard.startLeaderboardScheduler();

  // Auth admin utilities (dev ops)
  const authRoutes = require("./routes/auth") as typeof import("./routes/auth");
  app.post("/api/auth/seed-test-user", authRoutes.seedTestUser);

  // Profiles
  const profiles =
    require("./routes/profiles") as typeof import("./routes/profiles");
  app.get("/api/profiles/:id", profiles.getOrCreateProfileById);

  return app;
}

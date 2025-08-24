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
} from "./routes/slots";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Tournament routes
  app.get("/api/tournaments", getTournaments);
  app.get("/api/tournaments/:id", getTournament);
  app.post("/api/tournaments/:id/register", registerForTournament);
  app.post("/api/tournaments/:id/unregister", unregisterFromTournament);
  app.get("/api/tournaments/:id/leaderboard", getTournamentLeaderboard);
  app.post("/api/tournaments", createTournament);
  app.post("/api/tournaments/:id/start", startTournament);
  app.post("/api/tournaments/:id/cancel", cancelTournament);

  return app;
}

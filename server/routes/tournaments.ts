import { RequestHandler } from "express";
import { TournamentEngine } from "../gameEngine/TournamentEngine";

// Initialize tournament engine singleton
const tournamentEngine = new TournamentEngine();

// Get all tournaments
export const getTournaments: RequestHandler = (req, res) => {
  try {
    const tournaments = tournamentEngine.getTournaments();
    res.json({ tournaments });
  } catch (error) {
    console.error("Error getting tournaments:", error);
    res.status(500).json({ error: "Failed to get tournaments" });
  }
};

// Get specific tournament
export const getTournament: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const tournament = tournamentEngine.getTournament(id);

    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    res.json({ tournament });
  } catch (error) {
    console.error("Error getting tournament:", error);
    res.status(500).json({ error: "Failed to get tournament" });
  }
};

// Register for tournament
export const registerForTournament: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { playerId, playerName } = req.body;

    if (!playerId || !playerName) {
      return res.status(400).json({ error: "Player ID and name are required" });
    }

    const result = tournamentEngine.registerPlayer(id, {
      id: playerId,
      name: playerName,
      balance: { goldCoins: 0, sweepCoins: 0 },
      level: 1,
      isBot: false,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: "Successfully registered for tournament",
    });
  } catch (error) {
    console.error("Error registering for tournament:", error);
    res.status(500).json({ error: "Failed to register for tournament" });
  }
};

// Unregister from tournament
export const unregisterFromTournament: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }

    const result = tournamentEngine.unregisterPlayer(id, playerId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: "Successfully unregistered from tournament",
    });
  } catch (error) {
    console.error("Error unregistering from tournament:", error);
    res.status(500).json({ error: "Failed to unregister from tournament" });
  }
};

// Get tournament leaderboard
export const getTournamentLeaderboard: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const leaderboard = tournamentEngine.getLeaderboard(id);

    if (!leaderboard) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    res.json({ leaderboard });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
};

// Create new tournament (admin only)
export const createTournament: RequestHandler = (req, res) => {
  try {
    const tournamentData = req.body;

    // Validate required fields
    if (
      !tournamentData.name ||
      !tournamentData.gameType ||
      !tournamentData.type
    ) {
      return res
        .status(400)
        .json({ error: "Name, game type, and tournament type are required" });
    }

    const tournament = tournamentEngine.createTournament(tournamentData);
    res.json({ tournament });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ error: "Failed to create tournament" });
  }
};

// Start tournament manually (admin only)
export const startTournament: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = tournamentEngine.startTournament(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: "Tournament started successfully" });
  } catch (error) {
    console.error("Error starting tournament:", error);
    res.status(500).json({ error: "Failed to start tournament" });
  }
};

// Cancel tournament (admin only)
export const cancelTournament: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const result = tournamentEngine.cancelTournament(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: "Tournament cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling tournament:", error);
    res.status(500).json({ error: "Failed to cancel tournament" });
  }
};

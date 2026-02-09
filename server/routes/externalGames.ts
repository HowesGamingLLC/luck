import { RequestHandler } from "express";
import { getSupabaseAdmin } from "../lib/supabase";
import { v4 as uuidv4 } from "crypto";
import fs from "fs";
import path from "path";

function getSupabase() {
  return getSupabaseAdmin();
}

const THUMBNAILS_DIR = path.join(process.cwd(), "public", "thumbnails");

// Ensure thumbnails directory exists
if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

/**
 * Get all external games
 */
export const getExternalGames: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { enabled, offset = 0, limit = 20 } = req.query;

    let query = supabase.from("external_games").select("*");

    if (enabled === "true") {
      query = query.eq("enabled", true);
    }

    const { data, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ games: data || [], count: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Get external game by ID
 */
export const getExternalGameById: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { gameId } = req.params;

    const { data, error } = await supabase
      .from("external_games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Add a new external game
 */
export const addExternalGame: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const {
      title,
      description,
      gameUrl,
      thumbnailUrl,
      category = "external",
      provider = "external",
    } = req.body;

    if (!title || !gameUrl) {
      return res.status(400).json({ error: "Title and gameUrl are required" });
    }

    const gameId = uuidv4();
    let savedThumbnailPath = null;

    // Download and save thumbnail if provided
    if (thumbnailUrl) {
      try {
        const response = await fetch(thumbnailUrl as any);
        const buffer = await response.buffer();
        const filename = `${gameId}-${Date.now()}.png`;
        const filepath = path.join(THUMBNAILS_DIR, filename);

        fs.writeFileSync(filepath, buffer);
        savedThumbnailPath = `/thumbnails/${filename}`;
      } catch (err) {
        console.error("Error downloading thumbnail:", err);
        // Continue without thumbnail if download fails
      }
    }

    const { data, error } = await supabase.from("external_games").insert([
      {
        id: gameId,
        title,
        description,
        game_url: gameUrl,
        thumbnail_url: savedThumbnailPath || thumbnailUrl,
        category,
        provider,
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      id: gameId,
      title,
      description,
      game_url: gameUrl,
      thumbnail_url: savedThumbnailPath || thumbnailUrl,
      category,
      provider,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Update external game
 */
export const updateExternalGame: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { gameId } = req.params;
    const { title, description, enabled, thumbnailUrl } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (enabled !== undefined) updateData.enabled = enabled;

    // Handle thumbnail update
    if (thumbnailUrl) {
      try {
        const response = await fetch(thumbnailUrl as any);
        const buffer = await response.buffer();
        const filename = `${gameId}-${Date.now()}.png`;
        const filepath = path.join(THUMBNAILS_DIR, filename);

        fs.writeFileSync(filepath, buffer);
        updateData.thumbnail_url = `/thumbnails/${filename}`;
      } catch (err) {
        console.error("Error downloading thumbnail:", err);
      }
    }

    const { data, error } = await supabase
      .from("external_games")
      .update(updateData)
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * Delete external game
 */
export const deleteExternalGame: RequestHandler = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { gameId } = req.params;

    const { error } = await supabase
      .from("external_games")
      .delete()
      .eq("id", gameId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, message: "Game deleted" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

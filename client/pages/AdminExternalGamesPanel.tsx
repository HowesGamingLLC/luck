import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Eye, EyeOff } from "lucide-react";

interface ExternalGame {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  game_url: string;
  category?: string;
  provider?: string;
  enabled: boolean;
  created_at: string;
}

export const AdminExternalGamesPanel: React.FC = () => {
  const [games, setGames] = useState<ExternalGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGame, setEditingGame] = useState<ExternalGame | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gameUrl: "",
    thumbnailUrl: "",
    category: "external",
    provider: "external",
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/external-games");
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/external-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          gameUrl: formData.gameUrl,
          thumbnailUrl: formData.thumbnailUrl,
          category: formData.category,
          provider: formData.provider,
        }),
      });

      if (!response.ok) throw new Error("Failed to add game");
      
      setFormData({
        title: "",
        description: "",
        gameUrl: "",
        thumbnailUrl: "",
        category: "external",
        provider: "external",
      });
      setShowAddForm(false);
      await fetchGames();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    try {
      const response = await fetch(`/api/external-games/${editingGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          thumbnailUrl: formData.thumbnailUrl,
          enabled: editingGame.enabled,
        }),
      });

      if (!response.ok) throw new Error("Failed to update game");
      
      setEditingGame(null);
      setFormData({
        title: "",
        description: "",
        gameUrl: "",
        thumbnailUrl: "",
        category: "external",
        provider: "external",
      });
      await fetchGames();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;

    try {
      const response = await fetch(`/api/external-games/${gameId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete game");
      await fetchGames();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleToggleEnabled = async (gameId: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/external-games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (!response.ok) throw new Error("Failed to update game");
      await fetchGames();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">External Games</h2>
        {!showAddForm && !editingGame && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Game
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingGame) && (
        <form
          onSubmit={editingGame ? handleUpdateGame : handleAddGame}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">
            {editingGame ? "Edit Game" : "Add New Game"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Game title"
              />
            </div>

            {!editingGame && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.gameUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, gameUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  placeholder="https://example.com/game"
                />
              </div>
            )}

            {!editingGame && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Slots, Table Games"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) =>
                      setFormData({ ...formData, provider: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    placeholder="Provider name"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="Game description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) =>
                setFormData({ ...formData, thumbnailUrl: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="https://example.com/thumbnail.png"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              {editingGame ? "Update Game" : "Add Game"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingGame(null);
                setFormData({
                  title: "",
                  description: "",
                  gameUrl: "",
                  thumbnailUrl: "",
                  category: "external",
                  provider: "external",
                });
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Games Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-8">{error}</div>
      ) : games.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No games added yet</div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-gray-300 font-semibold">Title</th>
                <th className="px-6 py-3 text-left text-gray-300 font-semibold">Provider</th>
                <th className="px-6 py-3 text-left text-gray-300 font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                <th className="px-6 py-3 text-right text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr
                  key={game.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-3 text-white">{game.title}</td>
                  <td className="px-6 py-3 text-gray-400">{game.provider}</td>
                  <td className="px-6 py-3 text-gray-400">{game.category}</td>
                  <td className="px-6 py-3">
                    {game.enabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button
                      onClick={() =>
                        handleToggleEnabled(game.id, game.enabled)
                      }
                      className="p-2 hover:bg-gray-700 rounded transition-colors inline-flex items-center gap-2"
                      title={game.enabled ? "Disable" : "Enable"}
                    >
                      {game.enabled ? (
                        <Eye className="w-4 h-4 text-blue-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingGame(game);
                        setFormData({
                          title: game.title,
                          description: game.description || "",
                          gameUrl: game.game_url,
                          thumbnailUrl: game.thumbnail_url || "",
                          category: game.category || "",
                          provider: game.provider || "",
                        });
                      }}
                      className="p-2 hover:bg-gray-700 rounded transition-colors inline-flex"
                    >
                      <Edit2 className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-2 hover:bg-gray-700 rounded transition-colors inline-flex"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

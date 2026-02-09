import React, { useState, useEffect } from "react";
import { ExternalGameCard } from "@/components/ExternalGameCard";
import { ExternalGamePlayer } from "@/components/ExternalGamePlayer";
import { ArrowLeft } from "lucide-react";

interface ExternalGame {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  game_url: string;
  category?: string;
  provider?: string;
  enabled: boolean;
}

export const ExternalGamesPage: React.FC = () => {
  const [games, setGames] = useState<ExternalGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<ExternalGame | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/external-games?enabled=true");
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (selectedGame) {
    return (
      <ExternalGamePlayer
        gameId={selectedGame.id}
        gameUrl={selectedGame.game_url}
        title={selectedGame.title}
        fullscreen={true}
        onClose={() => setSelectedGame(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">External Games</h1>
          </div>
          <p className="text-gray-400">
            Play exciting games from our partner providers
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading games...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchGames}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No games available at the moment.</p>
          </div>
        )}

        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <ExternalGameCard
                key={game.id}
                id={game.id}
                title={game.title}
                description={game.description}
                thumbnailUrl={game.thumbnail_url}
                category={game.category}
                provider={game.provider}
                onPlay={() => setSelectedGame(game)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

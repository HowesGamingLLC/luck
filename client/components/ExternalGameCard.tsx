import React from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface ExternalGameCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  category?: string;
  provider?: string;
  onPlay: (gameId: string) => void;
}

export const ExternalGameCard: React.FC<ExternalGameCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  category,
  provider,
  onPlay,
}) => {
  return (
    <div className="group rounded-lg border border-gray-800 overflow-hidden bg-gray-900 hover:border-purple-500 transition-colors h-full flex flex-col">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-950 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-purple-950/20">
            <div className="text-center">
              <Play className="w-12 h-12 text-purple-400/50 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {provider || "External Game"}
              </p>
            </div>
          </div>
        )}

        {/* Play overlay */}
        <button
          onClick={() => onPlay(id)}
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </button>

        {/* Category badge */}
        {category && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600/80 rounded text-xs font-medium text-white">
            {category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="font-semibold text-white mb-2 line-clamp-2">{title}</h3>

        {description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {provider && (
          <p className="text-xs text-gray-500 mt-auto">By {provider}</p>
        )}
      </div>

      {/* Play button */}
      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <button
          onClick={() => onPlay(id)}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          Play Now
        </button>
      </div>
    </div>
  );
};

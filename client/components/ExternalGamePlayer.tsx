import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ExternalGamePlayerProps {
  gameId: string;
  gameUrl: string;
  title: string;
  onClose?: () => void;
  fullscreen?: boolean;
}

export const ExternalGamePlayer: React.FC<ExternalGamePlayerProps> = ({
  gameId,
  gameUrl,
  title,
  onClose,
  fullscreen = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [gameUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load game. Please try again.");
    setIsLoading(false);
  };

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading game...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          <iframe
            key={gameUrl}
            src={gameUrl}
            className="w-full h-full border-0"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-800 overflow-hidden bg-gray-900",
      )}
    >
      <div className="aspect-video relative bg-gray-950">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-950 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Loading game...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-gray-950 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <iframe
          key={gameUrl}
          src={gameUrl}
          className="w-full h-full border-0"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

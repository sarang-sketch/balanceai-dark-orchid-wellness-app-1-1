"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Maximize,
  Settings,
  Subtitles,
  Download,
  RotateCcw,
  Brain
} from "lucide-react";

interface EnhancedVideoPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
  onShow3D?: () => void;
}

const SUBTITLE_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" }
];

const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2];

export default function EnhancedVideoPlayer({ src, title, onClose, onShow3D }: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState("en");
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    // Check if video is already cached
    if ("caches" in window) {
      caches.match(src).then((response) => {
        setIsCached(!!response);
      });
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setIsControlsVisible(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, currentTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const toggleFullscreen = async () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const cacheVideo = async () => {
    setIsDownloading(true);
    try {
      if ("caches" in window) {
        const cache = await caches.open("balanceai-videos");
        const response = await fetch(src);
        await cache.put(src, response.clone());
        setIsCached(true);
      }
    } catch (error) {
      console.error("Failed to cache video:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="relative w-full max-w-5xl">
        {/* Brain Watermark */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <Brain className="w-6 h-6 text-orchid-neon opacity-50" />
          <span className="text-orchid-neon text-sm font-medium opacity-50">BalanceAI</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white hover:text-orchid-neon transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        {/* Video Container */}
        <div
          className="relative bg-black rounded-2xl overflow-hidden group"
          onMouseMove={() => setIsControlsVisible(true)}
        >
          <video
            ref={videoRef}
            src={src}
            className="w-full aspect-video"
            onClick={togglePlay}
          />

          {/* Custom Controls Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
              isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Top Controls */}
            <div className="absolute top-4 right-4 left-20 flex items-center justify-between">
              <h3 className="text-white font-medium">{title}</h3>

              <div className="flex items-center gap-2">
                {/* 3D Model Button */}
                {onShow3D && (
                  <button
                    onClick={onShow3D}
                    className="p-2 bg-orchid-neon/20 hover:bg-orchid-neon/30 text-orchid-neon rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                {/* Cache Button */}
                <button
                  onClick={cacheVideo}
                  disabled={isDownloading || isCached}
                  className="p-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? "animate-spin" : ""}`} />
                </button>

                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-white rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-zinc-800/50 hover:bg-zinc-800/70 text-white rounded-lg transition-colors"
                >
                  {isFullscreen ? <Maximize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #C71585 0%, #C71585 ${progress}%, #374151 ${progress}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
                  <span className="text-xs text-zinc-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-3 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-full transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-white hover:text-orchid-neon transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Subtitles Toggle */}
                  <button
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`p-2 rounded-lg transition-colors ${
                      showSubtitles
                        ? "bg-orchid-neon/20 text-orchid-neon"
                        : "text-white hover:text-orchid-neon"
                    }`}
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-2">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        playbackSpeed === speed
                          ? "bg-orchid-neon text-white"
                          : "bg-zinc-800/50 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute top-16 right-4 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 min-w-48 z-20">
              <h4 className="text-white font-medium mb-3">Settings</h4>

              {/* Subtitle Language */}
              <div className="mb-4">
                <label className="text-zinc-400 text-sm mb-2 block">Subtitles</label>
                <select
                  value={selectedSubtitle}
                  onChange={(e) => setSelectedSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-orchid/50"
                >
                  {SUBTITLE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cache Status */}
              <div className="text-sm">
                <span className="text-zinc-400">Offline: </span>
                <span className={isCached ? "text-green-500" : "text-zinc-500"}>
                  {isCached ? "Cached" : "Not cached"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #C71585;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #C71585;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
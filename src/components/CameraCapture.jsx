import React, { useEffect, useState, useRef } from "react";
import { useCamera } from "../hook/useCamera";
import { FILTERS } from "../constants";
import { Camera, RefreshCw, Volume2, VolumeX, Flame } from "lucide-react";

export default function CameraCapture({
  activeSlot,
  onCapture,
  currentFilter,
  onSelectFilter,
}) {
  const { videoRef, canvasRef, startCamera, stopCamera, capture } = useCamera();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showFlash, setShowFlash] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        setCameraError(null);
        await startCamera();
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
      }
    };
    initCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Synthesize sound effects using standard HTML5 AudioContext
  const playSynthSound = (frequency, duration, type = "sine") => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Failed to play synth sound:", e);
    }
  };

  const handleCaptureSequence = () => {
    if (isCountingDown) return;

    setIsCountingDown(true);
    setCountdown(3);
    playSynthSound(600, 0.15); // Countdown warning sound

    let currentCount = 3;
    const interval = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playSynthSound(600, 0.15); // Warning beep
      } else {
        clearInterval(interval);
        
        // Take photo
        playSynthSound(1000, 0.35, "triangle"); // Shutter sound
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);

        try {
          const image = capture();
          if (image) {
            onCapture(image);
          }
        } catch (e) {
          console.error("Failed to capture picture:", e);
        }

        setIsCountingDown(false);
      }
    }, 1000);
  };

  // Helper to get CSS classes for filters
  const getFilterClass = (filterId) => {
    return FILTERS.find((f) => f.id === filterId)?.class || "";
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
            <Camera className="w-5 h-5 text-indigo-600" />
            <span>Bilik Foto Live</span>
          </h3>
          <p className="text-xs text-gray-500">
            Mengambil foto untuk <strong className="text-indigo-600">Slot {activeSlot + 1}</strong>
          </p>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl transition-all border cursor-pointer ${
            soundEnabled
              ? "bg-indigo-50 border-indigo-100 text-indigo-600"
              : "bg-gray-50 border-gray-100 text-gray-400"
          }`}
          title={soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Suara"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Camera Live Feed Area */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-950 border border-gray-800 shadow-inner flex items-center justify-center">
        {cameraError ? (
          <div className="p-6 text-center text-rose-500 max-w-sm flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold mb-2">
              ⚠️
            </div>
            <p className="text-sm font-semibold">{cameraError}</p>
            <button
              onClick={() => {
                setCameraError(null);
                startCamera();
              }}
              className="mt-3 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Mirroring applied via -scale-x-100 for natural camera look */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover -scale-x-100 transition-all duration-300 ${getFilterClass(
                currentFilter
              )}`}
            />

            {/* Canvas for capturing (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Countdown Overlay */}
            {isCountingDown && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center animate-fade-in z-20 select-none">
                <div className="text-center scale-95 animate-scale-in">
                  <div className="text-8xl font-black text-white drop-shadow-[0_4px_12px_rgba(99,102,241,0.5)]">
                    {countdown}
                  </div>
                  <p className="text-indigo-200 text-xs uppercase font-bold tracking-widest mt-2">
                    Siap-siap!
                  </p>
                </div>
              </div>
            )}

            {/* Flash Overlay */}
            {showFlash && (
              <div className="absolute inset-0 bg-white animate-flash z-30 pointer-events-none" />
            )}

            {/* Guidelines helper box */}
            <div className="absolute inset-4 border border-white/10 rounded-xl pointer-events-none z-10 flex items-center justify-center">
              <div className="w-3/4 h-2/3 border border-dashed border-white/20 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-white/40 tracking-wider font-semibold uppercase">
                  Area Fokus
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Selector Row */}
      <div className="w-full space-y-2.5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Filter Studio Foto
        </h4>
        <div className="grid grid-cols-6 gap-2 w-full">
          {FILTERS.map((filter) => {
            const isActive = currentFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onSelectFilter(filter.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border text-center cursor-pointer ${
                  isActive
                    ? "bg-indigo-50/70 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20"
                    : "bg-gray-50/50 hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700"
                }`}
              >
                {/* Tiny filter preview pill */}
                <div
                  className={`w-6 h-6 rounded-full border border-gray-300 overflow-hidden bg-gradient-to-tr from-gray-500 to-indigo-400 ${filter.class}`}
                />
                <span className="text-[9px] font-bold truncate max-w-full">
                  {filter.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Capture Button */}
      <button
        onClick={handleCaptureSequence}
        disabled={isCountingDown || cameraError}
        className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg cursor-pointer ${
          isCountingDown
            ? "bg-indigo-400 cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] active:shadow-md hover:shadow-indigo-500/20"
        }`}
      >
        <Camera className={`w-5 h-5 ${isCountingDown ? "animate-spin" : ""}`} />
        <span>
          {isCountingDown ? `Mengambil Foto...` : `Ambil Foto Sekarang (3s)`}
        </span>
      </button>
    </div>
  );
}

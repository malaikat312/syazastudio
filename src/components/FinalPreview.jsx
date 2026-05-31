import React, { useRef, useState, useEffect } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants";
import { Download, RefreshCw, Sparkles, CheckCircle } from "lucide-react";

export default function FinalPreview({
  photos,
  photoSlots,
  selectedFrame,
  customFrame,
  customText,
  customTagline,
  onReset,
}) {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const confettiCanvasRef = useRef(null);

  // Confetti Particle System
  useEffect(() => {
    if (!confettiActive) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#FFC0CB", "#FF007F", "#00F0FF", "#FFD700", "#7B6E8D", "#8A2BE2"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0,
        speed: Math.random() * 3 + 2,
      });
    }

    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speed;
        p.x += Math.sin(p.tiltAngle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        if (p.y > canvas.height) {
          particles[idx] = {
            ...p,
            x: Math.random() * canvas.width,
            y: -20,
            tilt: Math.random() * 10 - 5,
          };
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Disable after 4 seconds
    const timer = setTimeout(() => {
      setConfettiActive(false);
      cancelAnimationFrame(animationFrameId);
    }, 4000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [confettiActive]);

  // Load an image safely in canvas
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  // Convert custom canvas CSS filter to HTML5 Canvas 2D filter property
  const getCanvasFilter = (filterId) => {
    switch (filterId) {
      case "mono":
        return "grayscale(1.1) brightness(1.1) contrast(1.25)";
      case "vintage":
        return "sepia(0.9) contrast(0.95) brightness(0.95) saturate(0.75) hue-rotate(15deg)";
      case "warm":
        return "saturate(1.25) sepia(0.15) contrast(1.05)";
      case "cyber":
        return "hue-rotate(280deg) saturate(1.5) contrast(1.1)";
      case "glow":
        return "brightness(1.05) contrast(0.95) saturate(1.1) blur(0.5px)";
      default:
        return "none";
    }
  };

  const generateCanvasImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // 1. Draw Background
      if (!customFrame) {
        // Draw pre-made frame background
        if (selectedFrame.canvasBgGradient) {
          const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
          grad.addColorStop(0, selectedFrame.canvasBgGradient[0]);
          grad.addColorStop(1, selectedFrame.canvasBgGradient[1]);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = selectedFrame.canvasBg || "#FFFFFF";
        }
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        // Draw transparent layout clean white background base
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      // 2. Draw Photos with clipping masks, filters, and scale/offset properties
      for (let i = 0; i < photoSlots.length; i++) {
        const slot = photoSlots[i];
        const photo = photos[i];

        if (photo) {
          ctx.save();

          // Create clipping rect for this photo slot
          ctx.beginPath();
          ctx.rect(slot.left, slot.y, slot.width, slot.height);
          ctx.clip();

          // Apply filters
          ctx.filter = getCanvasFilter(photo.filter || "normal");

          // Load image
          const img = await loadImage(photo.url);

          // Math to simulate center-cover zoom and translate
          const imgRatio = img.width / img.height;
          const slotRatio = slot.width / slot.height;

          let renderWidth, renderHeight;
          if (imgRatio > slotRatio) {
            renderHeight = slot.height;
            renderWidth = slot.height * imgRatio;
          } else {
            renderWidth = slot.width;
            renderHeight = slot.width / imgRatio;
          }

          // Default centered coordinate inside slot
          const cx = slot.left + (slot.width - renderWidth) / 2;
          const cy = slot.y + (slot.height - renderHeight) / 2;

          // Apply scale & nudge translations
          // Ratio scale from Preview width to Canvas width is (500 px / 240 px) = 2.08333
          const scaleFactor = 500 / 240; 
          const scale = photo.scale || 1.0;
          const tx = (photo.xOffset || 0) * scaleFactor;
          const ty = (photo.yOffset || 0) * scaleFactor;

          // We transform context to the center of the slot to scale, then translate, then draw
          ctx.translate(slot.left + slot.width / 2, slot.y + slot.height / 2);
          ctx.scale(scale, scale);
          ctx.translate(tx / scale, ty / scale);
          ctx.drawImage(
            img,
            -renderWidth / 2,
            -renderHeight / 2,
            renderWidth,
            renderHeight
          );

          ctx.restore();
        }
      }

      // 3. Draw Frame Overlays
      if (customFrame) {
        // Overlay custom transparent frame
        const frameImg = await loadImage(customFrame);
        ctx.filter = "none";
        ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        // Draw Pre-made frame footer text elements
        ctx.filter = "none";

        // Draw cute decorations
        ctx.fillStyle = selectedFrame.canvasTextColor;
        ctx.textAlign = "center";
        
        if (selectedFrame.decorations === "retro") {
          ctx.font = "bold 20px Georgia, serif";
          ctx.fillText("✦ ✦ ✦", CANVAS_WIDTH / 2, 1585);
        } else if (selectedFrame.decorations === "heart") {
          ctx.font = "bold 20px sans-serif";
          ctx.fillText("♥ ♥ ♥", CANVAS_WIDTH / 2, 1585);
        }

        // Draw main footer title text
        const txt = (customText || selectedFrame.footerText).toUpperCase();
        ctx.font = `black 40px ${
          selectedFrame.fontFamily === "serif" ? "Georgia, serif" : selectedFrame.fontFamily === "monospace" ? "Courier New, monospace" : "sans-serif"
        }`;
        ctx.fillText(txt, CANVAS_WIDTH / 2, 1640);

        // Draw tagline text
        const tag = (customTagline || selectedFrame.tagline).toUpperCase();
        ctx.font = "600 20px sans-serif";
        ctx.letterSpacing = "6px";
        ctx.fillStyle = `${selectedFrame.canvasTextColor}CC`; // 80% opacity
        ctx.fillText(tag, CANVAS_WIDTH / 2, 1690);
      }

      // 4. Download Trigger
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `photobooth-2x6-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setConfettiActive(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to render and download final strip:", e);
      alert("Maaf, terjadi kesalahan saat menyusun foto. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6 flex flex-col items-center">
      {/* Confetti Overlay Canvas */}
      {confettiActive && (
        <canvas
          ref={confettiCanvasRef}
          className="fixed inset-0 pointer-events-none z-50 w-screen h-screen"
        />
      )}

      {/* Off-screen high-quality canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="hidden"
      />

      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-emerald-950 bg-clip-text text-transparent">
          Bilik Foto Anda Siap!
        </h3>
        <p className="text-xs text-gray-500">
          Semua {photoSlots.length} slot terisi dengan sukses. Anda dapat mengunduh hasil 2x6 strip Anda sekarang.
        </p>
      </div>

      {/* Call to Actions */}
      <div className="w-full space-y-3">
        {/* Download Button */}
        <button
          onClick={generateCanvasImage}
          disabled={isGenerating}
          className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-white font-bold transition-all shadow-lg cursor-pointer ${
            isGenerating
              ? "bg-emerald-400 cursor-not-allowed shadow-none"
              : downloadSuccess
              ? "bg-emerald-600 shadow-emerald-600/20"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] active:shadow-md hover:shadow-emerald-500/20"
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Menyusun Kualitas Tinggi...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Berhasil Diunduh!</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Unduh Foto Cetak 2x6</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Ambil Foto Ulang (Sesi Baru)</span>
        </button>
      </div>
    </div>
  );
}

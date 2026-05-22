import React, { useRef, useState } from "react";
import { PHOTO_SLOTS, FILTERS } from "../constants";
import { Upload, Trash2, Move, ZoomIn, Camera } from "lucide-react";

export default function PhotoSlotManager({
  photos,
  activeSlot,
  setActiveSlot,
  selectedFrame,
  customFrame,
  onUploadPhoto,
  onDeletePhoto,
  onUpdatePhotoProperties,
  customText,
  customTagline,
}) {
  const fileInputRefs = useRef([]);
  const [dragStart, setDragStart] = useState(null);
  const [activeDragSlot, setActiveDragSlot] = useState(null);

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadPhoto(index, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrag = (e, index) => {
    if (!photos[index]) return;
    e.preventDefault();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setDragStart({ x: clientX, y: clientY, xOffset: photos[index].xOffset || 0, yOffset: photos[index].yOffset || 0 });
    setActiveDragSlot(index);
  };

  const onDrag = (e) => {
    if (activeDragSlot === null || !dragStart) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    if (clientX === undefined || clientY === undefined) return;

    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;

    onUpdatePhotoProperties(activeDragSlot, {
      xOffset: dragStart.xOffset + dx,
      yOffset: dragStart.yOffset + dy,
    });
  };

  const stopDrag = () => {
    setDragStart(null);
    setActiveDragSlot(null);
  };

  // Helper to get CSS classes for filters
  const getFilterClass = (filterId) => {
    return FILTERS.find((f) => f.id === filterId)?.class || "";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 2x6 Strip Preview Container */}
      <div
        className="relative w-72 aspect-[1/3] rounded-2xl shadow-2xl overflow-hidden select-none border border-gray-200 bg-white"
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchMove={onDrag}
        onTouchEnd={stopDrag}
      >
        {/* Underlay layer: Photos container */}
        <div className="absolute inset-0 z-0">
          {/* If there's a pre-made frame, render its background */}
          {!customFrame && (
            <div className={`absolute inset-0 ${selectedFrame?.bgClass}`} />
          )}

          {/* Photo slots rendering */}
          {PHOTO_SLOTS.map((slot, index) => {
            const photo = photos[index];
            const isSlotActive = activeSlot === index;
            const topPercent = (slot.y / 1800) * 100;
            const heightPercent = (slot.height / 1800) * 100;
            const leftPercent = (50 / 600) * 100;
            const widthPercent = (500 / 600) * 100;

            return (
              <div
                key={index}
                onClick={() => setActiveSlot(index)}
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                className={`absolute rounded overflow-hidden flex items-center justify-center transition-all duration-200 group cursor-pointer ${
                  isSlotActive
                    ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white z-20"
                    : "ring-1 ring-black/5 hover:ring-indigo-400 z-10"
                } ${!photo ? "bg-gray-50/90 border border-dashed border-gray-300" : ""}`}
              >
                {photo ? (
                  // Captured/Uploaded photo
                  <div
                    className="relative w-full h-full overflow-hidden"
                    onMouseDown={(e) => startDrag(e, index)}
                    onTouchStart={(e) => startDrag(e, index)}
                  >
                    <img
                      src={photo.url}
                      alt={`Slot ${index + 1}`}
                      className={`absolute object-cover origin-center transition-transform duration-75 pointer-events-none select-none ${getFilterClass(
                        photo.filter || "normal"
                      )}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        transform: `scale(${photo.scale || 1.0}) translate(${
                          photo.xOffset || 0
                        }px, ${photo.yOffset || 0}px)`,
                      }}
                    />

                    {/* Drag indicator overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <Move className="w-5 h-5 text-white animate-bounce" />
                      <span className="text-[10px] text-white font-medium uppercase tracking-wider">
                        Tahan & Geser
                      </span>
                    </div>
                  </div>
                ) : (
                  // Empty slot controls
                  <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400 gap-1 select-none">
                    {isSlotActive ? (
                      <div className="flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-indigo-600">Bilik Aktif</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-bold text-gray-400">SLOT {index + 1}</span>
                        <span className="text-[8px] text-gray-400">Klik untuk pilih</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Slot index label */}
                <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold z-20 shadow">
                  {index + 1}
                </div>
              </div>
            );
          })}

          {/* Footer Area for Premade Frames */}
          {!customFrame && selectedFrame && (
            <div
              style={{
                top: `${(1512 / 1800) * 100}%`,
                height: `${(288 / 1800) * 100}%`,
              }}
              className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center px-4 text-center select-none"
            >
              {/* Retro decorative elements */}
              {selectedFrame.decorations === "retro" && (
                <div className={`text-[8px] opacity-60 ${selectedFrame.textColor} mb-0.5`}>
                  ✦ ✦ ✦
                </div>
              )}
              {selectedFrame.decorations === "heart" && (
                <div className={`text-[8px] opacity-60 ${selectedFrame.textColor} mb-0.5`}>
                  ♥ ♥ ♥
                </div>
              )}

              {/* Main footer text */}
              <p
                style={{
                  fontFamily: selectedFrame.fontFamily === "serif" ? "Georgia, serif" : selectedFrame.fontFamily === "monospace" ? "Courier New, monospace" : "inherit",
                }}
                className={`text-sm font-black tracking-wider uppercase truncate ${selectedFrame.textColor} max-w-full`}
              >
                {customText || selectedFrame.footerText}
              </p>

              {/* Tagline */}
              <p
                className={`text-[8px] font-semibold tracking-widest uppercase opacity-75 truncate ${selectedFrame.textColor} mt-0.5`}
              >
                {customTagline || selectedFrame.tagline}
              </p>
            </div>
          )}
        </div>

        {/* Overlay layer: Custom uploaded PNG frame */}
        {customFrame && (
          <img
            src={customFrame}
            alt="Custom Frame Overlay"
            className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
          />
        )}
      </div>

      {/* Manual Slot Controls (Direct Upload, Zoom, Delete) */}
      <div className="w-full max-w-sm bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-lg space-y-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Kontrol Slot Foto {activeSlot + 1}
        </h4>

        <div className="flex items-center gap-3">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRefs.current[activeSlot]?.click()}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Foto</span>
            <input
              type="file"
              ref={(el) => (fileInputRefs.current[activeSlot] = el)}
              onChange={(e) => handleFileChange(e, activeSlot)}
              accept="image/*"
              className="hidden"
            />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDeletePhoto(activeSlot)}
            disabled={!photos[activeSlot]}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
              photos[activeSlot]
                ? "bg-rose-50 hover:bg-rose-100 text-rose-600 active:bg-rose-200"
                : "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus</span>
          </button>
        </div>

        {/* Zoom Slider for Active Slot */}
        {photos[activeSlot] && (
          <div className="space-y-1.5 p-3 bg-indigo-50/40 rounded-xl border border-indigo-50">
            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-950">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-500" />
                Skala Perbesar (Zoom)
              </span>
              <span>{Math.round((photos[activeSlot].scale || 1.0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={photos[activeSlot].scale || 1.0}
              onChange={(e) =>
                onUpdatePhotoProperties(activeSlot, {
                  scale: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[9px] text-gray-400 italic">
              *Klik & seret foto di dalam bingkai di atas untuk menggeser posisi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

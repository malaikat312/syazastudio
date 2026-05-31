import React, { useRef, useState } from "react";
import { PHOTO_SLOTS, FILTERS } from "../constants";
import { Upload, Trash2, Move, ZoomIn, Camera } from "lucide-react";

export default function PhotoSlotManager({
  photos,
  photoSlots,
  setPhotoSlots,
  isEditingLayout,
  setIsEditingLayout,
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

  // States for layout adjusting
  const [activeMoveSlotId, setActiveMoveSlotId] = useState(null);
  const [activeResizeSlotId, setActiveResizeSlotId] = useState(null);
  const [dragStartCoords, setDragStartCoords] = useState(null);

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

  // Layout Adjustment Handlers
  const handleSlotMouseDown = (e, slotId, isResize) => {
    e.stopPropagation();
    e.preventDefault();
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    const slot = photoSlots.find(s => s.id === slotId);
    if (!slot) return;
    
    setDragStartCoords({
      x: clientX,
      y: clientY,
      left: slot.left,
      yPos: slot.y,
      width: slot.width,
      height: slot.height
    });
    
    if (isResize) {
      setActiveResizeSlotId(slotId);
    } else {
      setActiveMoveSlotId(slotId);
    }
    setActiveSlot(slotId);
  };

  const handleContainerMouseMove = (e) => {
    if (activeMoveSlotId === null && activeResizeSlotId === null) return;
    if (!dragStartCoords) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    if (clientX === undefined || clientY === undefined) return;
    
    const dx = clientX - dragStartCoords.x;
    const dy = clientY - dragStartCoords.y;
    
    // Scale delta pixels from DOM coordinates (288px width) to Canvas coordinates (600px width)
    const scaleFactor = 600 / 288;
    const canvasDx = dx * scaleFactor;
    const canvasDy = dy * scaleFactor;
    
    const updatedSlots = photoSlots.map(s => {
      if (s.id === activeMoveSlotId) {
        const newLeft = Math.max(0, Math.min(600 - s.width, dragStartCoords.left + canvasDx));
        const newY = Math.max(0, Math.min(1800 - s.height, dragStartCoords.yPos + canvasDy));
        return { ...s, left: Math.round(newLeft), y: Math.round(newY) };
      }
      if (s.id === activeResizeSlotId) {
        const newWidth = Math.max(50, Math.min(600 - s.left, dragStartCoords.width + canvasDx));
        const newHeight = Math.max(50, Math.min(1800 - s.y, dragStartCoords.height + canvasDy));
        return { ...s, width: Math.round(newWidth), height: Math.round(newHeight) };
      }
      return s;
    });
    
    setPhotoSlots(updatedSlots);
  };

  const handleContainerMouseUp = () => {
    setActiveMoveSlotId(null);
    setActiveResizeSlotId(null);
    setDragStartCoords(null);
  };

  const handleCoordinateSliderChange = (property, value) => {
    const updatedSlots = photoSlots.map(s => {
      if (s.id === activeSlot) {
        return { ...s, [property]: value };
      }
      return s;
    });
    setPhotoSlots(updatedSlots);
  };

  const handleSlotsCountChange = (count) => {
    const newSlots = [];
    const padding = 50;
    const availableHeight = 1800 - padding * 2;
    const gap = 30;
    const slotHeight = Math.round((availableHeight - gap * (count - 1)) / count);
    
    for (let i = 0; i < count; i++) {
      newSlots.push({
        id: i,
        left: 50,
        y: padding + i * (slotHeight + gap),
        width: 500,
        height: slotHeight
      });
    }
    setPhotoSlots(newSlots);
  };

  const handleDeleteActiveSlot = () => {
    if (photoSlots.length <= 1) return;
    const updatedSlots = photoSlots
      .filter(s => s.id !== activeSlot)
      .map((s, index) => ({ ...s, id: index }));
    setPhotoSlots(updatedSlots);
    setActiveSlot(0);
  };

  const handleAddSlot = () => {
    if (photoSlots.length >= 6) return;
    const lastSlot = photoSlots[photoSlots.length - 1];
    let nextY = 100;
    if (lastSlot) {
      nextY = lastSlot.y + lastSlot.height + 40;
    }
    if (nextY + 200 > 1800) {
      nextY = 1800 - 250;
    }
    
    const newSlot = {
      id: photoSlots.length,
      left: 50,
      y: nextY,
      width: 500,
      height: 250
    };
    
    setPhotoSlots([...photoSlots, newSlot]);
    setActiveSlot(newSlot.id);
  };

  // Helper to get CSS classes for filters
  const getFilterClass = (filterId) => {
    return FILTERS.find((f) => f.id === filterId)?.class || "";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Dynamic Layout Customization Mode Trigger */}
      {customFrame && (
        <div className="w-full max-w-sm flex bg-white/90 backdrop-blur-md p-2.5 border border-indigo-100 rounded-2xl shadow-lg justify-between items-center gap-3 animate-fade-in">
          <div className="flex flex-col">
            <span className="text-xs font-black text-indigo-950">Atur Tata Letak Lubang?</span>
            <span className="text-[10px] text-gray-500 font-semibold">Sesuaikan slot foto dengan lubang PNG</span>
          </div>
          <button
            onClick={() => setIsEditingLayout(!isEditingLayout)}
            className={`py-2 px-4 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
              isEditingLayout
                ? "bg-pink-500 text-white shadow-pink-500/20"
                : "bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {isEditingLayout ? "Selesai & Simpan ✓" : "Mulai Penyetelan 🛠"}
          </button>
        </div>
      )}

      {/* 2x6 Strip Preview Container */}
      <div
        className={`relative w-72 aspect-[1/3] rounded-2xl shadow-2xl overflow-hidden select-none border bg-white ${
          isEditingLayout ? "border-pink-300 ring-4 ring-pink-500/10" : "border-gray-200"
        }`}
        onMouseMove={isEditingLayout ? handleContainerMouseMove : onDrag}
        onMouseUp={isEditingLayout ? handleContainerMouseUp : stopDrag}
        onMouseLeave={isEditingLayout ? handleContainerMouseUp : stopDrag}
        onTouchMove={isEditingLayout ? handleContainerMouseMove : onDrag}
        onTouchEnd={isEditingLayout ? handleContainerMouseUp : stopDrag}
      >
        {/* Underlay layer: Photos container */}
        <div className="absolute inset-0 z-0">
          {/* If there's a pre-made frame, render its background */}
          {!customFrame && (
            <div className={`absolute inset-0 ${selectedFrame?.bgClass}`} />
          )}

          {/* Photo slots rendering */}
          {photoSlots.map((slot, index) => {
            const photo = photos[index];
            const isSlotActive = activeSlot === index;
            const topPercent = (slot.y / 1800) * 100;
            const heightPercent = (slot.height / 1800) * 100;
            const leftPercent = (slot.left / 600) * 100;
            const widthPercent = (slot.width / 600) * 100;

            return (
              <div
                key={index}
                onClick={() => setActiveSlot(index)}
                onMouseDown={(e) => isEditingLayout ? handleSlotMouseDown(e, slot.id, false) : null}
                onTouchStart={(e) => isEditingLayout ? handleSlotMouseDown(e, slot.id, false) : null}
                style={{
                  top: `${topPercent}%`,
                  height: `${heightPercent}%`,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                }}
                className={`absolute rounded overflow-hidden flex items-center justify-center transition-all duration-75 group cursor-pointer ${
                  isSlotActive
                    ? isEditingLayout
                      ? "ring-2 ring-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)] z-30 bg-pink-500/10 cursor-move"
                      : "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white z-20"
                    : isEditingLayout
                    ? "border-2 border-dashed border-cyan-400 bg-cyan-400/5 hover:border-cyan-300 z-15 cursor-move"
                    : "ring-1 ring-black/5 hover:ring-indigo-400 z-10"
                } ${!photo && !isEditingLayout ? "bg-gray-50/90 border border-dashed border-gray-300" : ""}`}
              >
                {photo ? (
                  // Captured/Uploaded photo
                  <div
                    className={`relative w-full h-full overflow-hidden ${isEditingLayout ? "opacity-40" : ""}`}
                    onMouseDown={(e) => !isEditingLayout ? startDrag(e, index) : null}
                    onTouchStart={(e) => !isEditingLayout ? startDrag(e, index) : null}
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
                    {!isEditingLayout && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                        <Move className="w-5 h-5 text-white animate-bounce" />
                        <span className="text-[10px] text-white font-medium uppercase tracking-wider">
                          Tahan & Geser
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Empty slot controls
                  <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400 gap-1 select-none">
                    {isSlotActive ? (
                      <div className="flex flex-col items-center gap-1">
                        <Camera className={`w-5 h-5 text-indigo-500 ${isEditingLayout ? "" : "animate-pulse"}`} />
                        <span className={`text-[10px] font-semibold ${isEditingLayout ? "text-pink-600" : "text-indigo-600"}`}>
                          {isEditingLayout ? "Lubang Aktif" : "Bilik Aktif"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] font-bold text-gray-400">SLOT {index + 1}</span>
                        {!isEditingLayout && <span className="text-[8px] text-gray-400">Klik untuk pilih</span>}
                      </div>
                    )}
                  </div>
                )}

                {/* Real-time size display if editing */}
                {isEditingLayout && (
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-white font-bold pointer-events-none">
                    {slot.width}x{slot.height}
                  </div>
                )}

                {/* Drag / Resize handle for active slot in edit mode */}
                {isEditingLayout && isSlotActive && (
                  <div
                    onMouseDown={(e) => handleSlotMouseDown(e, slot.id, true)}
                    onTouchStart={(e) => handleSlotMouseDown(e, slot.id, true)}
                    className="absolute bottom-1 right-1 w-6 h-6 bg-pink-500 rounded-full border-2 border-white cursor-se-resize flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 z-40 transition-transform"
                    title="Tarik untuk mengubah ukuran"
                  >
                    <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-white rotate-45" />
                  </div>
                )}

                {/* Slot index label */}
                <div className={`absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold z-20 shadow ${
                  isEditingLayout ? "bg-pink-600" : ""
                }`}>
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

      {/* Control Panel: Switch between Layout Customizer or Standard photo editor */}
      {isEditingLayout ? (
        /* Layout Customizer Panel */
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md border border-pink-100 rounded-2xl p-4 shadow-xl space-y-4 animate-scale-in">
          <div className="flex items-center justify-between border-b border-pink-50 pb-2">
            <h4 className="text-xs font-black text-pink-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>🛠 Penyetel Lubang Foto</span>
            </h4>
            <button
              onClick={() => handleSlotsCountChange(4)}
              className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors uppercase cursor-pointer"
            >
              Reset ke Standar
            </button>
          </div>

          {/* Number of slots selection */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Jumlah Lubang Foto</label>
            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSlotsCountChange(num)}
                  className={`py-1 rounded-lg text-xs font-black transition-all border cursor-pointer ${
                    photoSlots.length === num
                      ? "bg-pink-50 border-pink-200 text-pink-600"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Active Slot Coordinates Controllers */}
          <div className="space-y-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              <span>Koordinat Slot {activeSlot + 1}</span>
              <span className="text-[9px] text-pink-500 font-extrabold bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                Piksel
              </span>
            </div>
            
            {/* Slider for Left (X) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-gray-500">
                <span>Posisi Horizontal (X)</span>
                <span>{photoSlots[activeSlot]?.left || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max={`${600 - (photoSlots[activeSlot]?.width || 50)}`}
                value={photoSlots[activeSlot]?.left || 0}
                onChange={(e) => handleCoordinateSliderChange("left", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Slider for Y (Top) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-gray-500">
                <span>Posisi Vertikal (Y)</span>
                <span>{photoSlots[activeSlot]?.y || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max={`${1800 - (photoSlots[activeSlot]?.height || 50)}`}
                value={photoSlots[activeSlot]?.y || 0}
                onChange={(e) => handleCoordinateSliderChange("y", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Slider for Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-gray-500">
                <span>Lebar Lubang</span>
                <span>{photoSlots[activeSlot]?.width || 100}px</span>
              </div>
              <input
                type="range"
                min="50"
                max={`${600 - (photoSlots[activeSlot]?.left || 0)}`}
                value={photoSlots[activeSlot]?.width || 100}
                onChange={(e) => handleCoordinateSliderChange("width", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Slider for Height */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-gray-500">
                <span>Tinggi Lubang</span>
                <span>{photoSlots[activeSlot]?.height || 100}px</span>
              </div>
              <input
                type="range"
                min="50"
                max={`${1800 - (photoSlots[activeSlot]?.y || 0)}`}
                value={photoSlots[activeSlot]?.height || 100}
                onChange={(e) => handleCoordinateSliderChange("height", parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {/* Delete slot button */}
            <button
              onClick={handleDeleteActiveSlot}
              disabled={photoSlots.length <= 1}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                photoSlots.length > 1
                  ? "bg-rose-50 hover:bg-rose-100 text-rose-600"
                  : "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
              }`}
            >
              Hapus Lubang Ini
            </button>

            {/* Add slot button */}
            <button
              onClick={handleAddSlot}
              disabled={photoSlots.length >= 6}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all cursor-pointer ${
                photoSlots.length < 6
                  ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
                  : "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
              }`}
            >
              Tambah Lubang
            </button>
          </div>

          <button
            onClick={() => setIsEditingLayout(false)}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md shadow-pink-500/20"
          >
            Simpan & Selesai Tata Letak ✓
          </button>
        </div>
      ) : (
        /* Manual Slot Controls (Direct Upload, Zoom, Delete) */
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
      )}
    </div>
  );
}

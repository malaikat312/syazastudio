import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PREMADE_FRAMES } from "../constants";
import FrameSelector from "../components/FrameSelector";
import CameraCapture from "../components/CameraCapture";
import PhotoSlotManager from "../components/PhotoSlotManager";
import FinalPreview from "../components/FinalPreview";
import { detectTransparentHoles } from "../utils/holeDetector";
import { Sparkles, ArrowLeft, Layers, Image as ImageIcon, Camera as CameraIcon } from "lucide-react";

export default function Camera() {
  const navigate = useNavigate();
  
  // App state
  const [photoSlots, setPhotoSlots] = useState([
    { id: 0, y: 60, left: 50, width: 500, height: 333 },
    { id: 1, y: 433, left: 50, width: 500, height: 333 },
    { id: 2, y: 806, left: 50, width: 500, height: 333 },
    { id: 3, y: 1179, left: 50, width: 500, height: 333 }
  ]);
  const [photos, setPhotos] = useState(() => Array(4).fill(null));
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState(PREMADE_FRAMES[0]);
  const [customFrame, setCustomFrame] = useState(null);
  const [customText, setCustomText] = useState("");
  const [customTagline, setCustomTagline] = useState("");
  const [currentFilter, setCurrentFilter] = useState("normal");
  const [activeTab, setActiveTab] = useState("studio"); // "studio" or "preview"
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  // Sync photos array with dynamic slots count
  useEffect(() => {
    setPhotos((prev) => {
      const next = [...prev];
      if (next.length < photoSlots.length) {
        while (next.length < photoSlots.length) {
          next.push(null);
        }
      } else if (next.length > photoSlots.length) {
        return next.slice(0, photoSlots.length);
      }
      return next;
    });
    if (activeSlot >= photoSlots.length) {
      setActiveSlot(Math.max(0, photoSlots.length - 1));
    }
  }, [photoSlots.length]);

  // Check if all slots are filled
  const isAllFilled = photos.every((p) => p !== null);

  // Sync active slot filter with camera filter when user changes selection
  const handleSelectFilter = (filterId) => {
    setCurrentFilter(filterId);
    
    // Also apply filter retroactively to the active photo slot if it exists!
    if (photos[activeSlot]) {
      const newPhotos = [...photos];
      newPhotos[activeSlot] = {
        ...newPhotos[activeSlot],
        filter: filterId,
      };
      setPhotos(newPhotos);
    }
  };

  // Handle camera capture action
  const handleCapture = (imageDataUrl) => {
    const newPhotos = [...photos];
    newPhotos[activeSlot] = {
      url: imageDataUrl,
      filter: currentFilter,
      scale: 1.0,
      xOffset: 0,
      yOffset: 0,
    };
    setPhotos(newPhotos);

    // Auto-advance active slot to next empty slot
    const nextEmpty = newPhotos.findIndex((p) => p === null);
    if (nextEmpty !== -1) {
      setActiveSlot(nextEmpty);
    } else {
      // If all slots are filled, keep current active slot or highlight 0
      // Do not auto-advance if all are filled
    }
  };

  // Handle manual photo upload per slot
  const handleUploadPhoto = (index, imageDataUrl) => {
    const newPhotos = [...photos];
    newPhotos[index] = {
      url: imageDataUrl,
      filter: "normal",
      scale: 1.0,
      xOffset: 0,
      yOffset: 0,
    };
    setPhotos(newPhotos);

    // Auto-advance active slot if the slot that got filled was the current active slot
    if (activeSlot === index) {
      const nextEmpty = newPhotos.findIndex((p) => p === null);
      if (nextEmpty !== -1) {
        setActiveSlot(nextEmpty);
      }
    }
  };

  // Handle manual photo deletion per slot
  const handleDeletePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
    setActiveSlot(index); // Move active slot focus to deleted slot
  };

  // Handle drag/zoom properties update per slot
  const handleUpdatePhotoProperties = (index, newProps) => {
    const newPhotos = [...photos];
    if (newPhotos[index]) {
      newPhotos[index] = {
        ...newPhotos[index],
        ...newProps,
      };
      setPhotos(newPhotos);
    }
  };

  const handleUploadCustomFrame = (imageDataUrl) => {
    setCustomFrame(imageDataUrl);
    
    if (imageDataUrl) {
      const img = new Image();
      img.src = imageDataUrl;
      img.onload = () => {
        const detectedSlots = detectTransparentHoles(img);
        if (detectedSlots && detectedSlots.length > 0) {
          setPhotoSlots(detectedSlots);
        } else {
          // Fallback to standard 4 slots
          setPhotoSlots([
            { id: 0, y: 60, left: 50, width: 500, height: 333 },
            { id: 1, y: 433, left: 50, width: 500, height: 333 },
            { id: 2, y: 806, left: 50, width: 500, height: 333 },
            { id: 3, y: 1179, left: 50, width: 500, height: 333 }
          ]);
          alert("Tidak ada lubang transparan terdeteksi. Menggunakan tata letak standar 4 slot.");
        }
      };
    }
  };

  const handleClearCustomFrame = () => {
    setCustomFrame(null);
    setPhotoSlots([
      { id: 0, y: 60, left: 50, width: 500, height: 333 },
      { id: 1, y: 433, left: 50, width: 500, height: 333 },
      { id: 2, y: 806, left: 50, width: 500, height: 333 },
      { id: 3, y: 1179, left: 50, width: 500, height: 333 }
    ]);
  };

  const handleResetSession = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua foto dan memulai sesi baru?")) {
      setPhotos(Array(photoSlots.length).fill(null));
      setActiveSlot(0);
      setCurrentFilter("normal");
      setActiveTab("studio");
    }
  };

  return (
    <div className="min-h-screen bg-[#07060c] text-gray-100 flex flex-col font-sans overflow-x-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Studio */}
      <header className="sticky top-0 bg-[#07060c]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/5 active:scale-95 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer border border-white/5"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-black bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Kembali</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-semibold tracking-wider">RETRO STRIP BOOTH</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
          <button
            onClick={() => setActiveTab("studio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "studio"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CameraIcon className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
          
          <button
            onClick={() => setActiveTab("preview")}
            disabled={!isAllFilled}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-indigo-600 text-white shadow-sm cursor-pointer"
                : isAllFilled
                ? "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                : "text-gray-600 cursor-not-allowed opacity-50"
            }`}
            title={!isAllFilled ? "Isi semua 4 slot foto terlebih dahulu!" : ""}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hasil Akhir</span>
            {isAllFilled && activeTab !== "preview" && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </header>

      {/* Main Studio View Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10 flex flex-col items-center">
        {activeTab === "studio" ? (
          /* Workspace Layout Grid: Left Panel (Feed + Selectors) & Right Panel (Photo Strip Manager) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
            
            {/* LEFT SECTION (Live Feed + Frame Selector) */}
            <div className="lg:col-span-7 flex flex-col gap-6 w-full">
              {/* Live stream */}
              <CameraCapture
                activeSlot={activeSlot}
                onCapture={handleCapture}
                currentFilter={currentFilter}
                onSelectFilter={handleSelectFilter}
              />

              {/* Frame selection */}
              <FrameSelector
                selectedFrame={selectedFrame}
                onSelectFrame={setSelectedFrame}
                customFrame={customFrame}
                onUploadCustomFrame={handleUploadCustomFrame}
                onClearCustomFrame={handleClearCustomFrame}
                customText={customText}
                onChangeCustomText={setCustomText}
                customTagline={customTagline}
                onChangeCustomTagline={setCustomTagline}
              />
            </div>

            {/* RIGHT SECTION (Interactive 2x6 Photo Strip) */}
            <div className="lg:col-span-5 w-full flex flex-col items-center lg:sticky lg:top-24 gap-6">
              
              {/* Highlight Banner if All Filled */}
              {isAllFilled && (
                <div className="w-full max-w-sm bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center space-y-2 animate-bounce-subtle shadow-lg backdrop-blur-sm">
                  <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Semua Foto Siap!
                  </p>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                  >
                    Lihat Hasil Akhir ✨
                  </button>
                </div>
              )}

              {/* Photo Strip view */}
              <PhotoSlotManager
                photos={photos}
                photoSlots={photoSlots}
                setPhotoSlots={setPhotoSlots}
                isEditingLayout={isEditingLayout}
                setIsEditingLayout={setIsEditingLayout}
                activeSlot={activeSlot}
                setActiveSlot={setActiveSlot}
                selectedFrame={selectedFrame}
                customFrame={customFrame}
                onUploadPhoto={handleUploadPhoto}
                onDeletePhoto={handleDeletePhoto}
                onUpdatePhotoProperties={handleUpdatePhotoProperties}
                customText={customText}
                customTagline={customTagline}
              />
            </div>

          </div>
        ) : (
          /* PREVIEW & EXPORT TAB */
          <div className="w-full flex justify-center py-6 animate-scale-in">
            <FinalPreview
              photos={photos}
              photoSlots={photoSlots}
              selectedFrame={selectedFrame}
              customFrame={customFrame}
              customText={customText}
              customTagline={customTagline}
              onReset={handleResetSession}
            />
          </div>
        )}
      </main>
    </div>
  );
}
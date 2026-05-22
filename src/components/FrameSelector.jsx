import React, { useRef } from "react";
import { PREMADE_FRAMES } from "../constants";
import { Upload, X, Type, Sparkles } from "lucide-react";

export default function FrameSelector({
  selectedFrame,
  onSelectFrame,
  customFrame,
  onUploadCustomFrame,
  onClearCustomFrame,
  customText,
  onChangeCustomText,
  customTagline,
  onChangeCustomTagline,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadCustomFrame(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Silakan unggah file berformat PNG transparan.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-indigo-950 bg-clip-text text-transparent">
          Pilih atau Unggah Frame 2x6
        </h2>
      </div>

      {/* Grid Frames Bawaan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PREMADE_FRAMES.map((frame) => {
          const isSelected = selectedFrame?.id === frame.id && !customFrame;
          return (
            <button
              key={frame.id}
              onClick={() => {
                onClearCustomFrame();
                onSelectFrame(frame);
              }}
              className={`relative overflow-hidden aspect-[1/3] rounded-xl border-2 transition-all duration-300 group flex flex-col justify-between p-2 shadow-sm cursor-pointer ${
                isSelected
                  ? "border-indigo-600 ring-4 ring-indigo-500/20 scale-[1.02]"
                  : "border-gray-200 hover:border-gray-300 hover:scale-[1.01]"
              } ${frame.bgClass}`}
            >
              {/* Photo Box Placeholders */}
              <div className="space-y-1.5 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full aspect-[3/2] bg-white/20 rounded border border-white/30 flex items-center justify-center text-[10px] text-gray-500"
                  >
                    Slot {i}
                  </div>
                ))}
              </div>

              {/* Footer Text */}
              <div className="w-full text-center py-1 overflow-hidden mt-auto">
                <p className={`text-[8px] font-bold ${frame.textColor} truncate`}>
                  {isSelected ? customText || frame.footerText : frame.footerText}
                </p>
                <p className={`text-[6px] opacity-75 ${frame.textColor} truncate`}>
                  {isSelected ? customTagline || frame.tagline : frame.tagline}
                </p>
              </div>

              {/* Active Overlay */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Frame Upload Section */}
      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Frame PNG Kustom (Rasio 1:3 / 2x6)</h3>
        
        {customFrame ? (
          <div className="relative flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-24 bg-gray-100 rounded border border-gray-200 overflow-hidden relative">
                <img
                  src={customFrame}
                  alt="Custom Frame Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-900">Frame Kustom Aktif</p>
                <p className="text-[10px] text-indigo-500">PNG Transparan terdeteksi</p>
              </div>
            </div>

            <button
              onClick={() => {
                onClearCustomFrame();
                onSelectFrame(PREMADE_FRAMES[0]); // Reset to first premade
              }}
              className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="Hapus Frame Kustom"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png"
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto text-gray-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300" />
            <p className="text-xs font-semibold text-gray-600 mt-2">
              Klik untuk unggah frame PNG kustom Anda
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Harus berformat PNG transparan (Rasio 2x6 / 1:3)
            </p>
          </div>
        )}
      </div>

      {/* Text Customization Section for Premade Frames */}
      {!customFrame && selectedFrame && (
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <Type className="w-4 h-4 text-indigo-500" />
            <span>Kustomisasi Teks Frame Bawaan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                Teks Utama (Footer)
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => onChangeCustomText(e.target.value)}
                placeholder={selectedFrame.footerText}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">
                Tagline Utama
              </label>
              <input
                type="text"
                value={customTagline}
                onChange={(e) => onChangeCustomTagline(e.target.value)}
                placeholder={selectedFrame.tagline}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, Image as ImageIcon, Heart } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090810] text-gray-100 flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">
      {/* Radiant Glow Orbs in Background */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1e29_1px,transparent_1px),linear-gradient(to_bottom,#1f1e29_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Main Container */}
      <div className="max-w-xl w-full text-center space-y-8 relative z-10">
        
        {/* Cute floating badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 backdrop-blur-md text-xs font-bold text-indigo-200 uppercase tracking-widest animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Software Photobooth</span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              SYAZA STUDIO
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-extrabold text-4xl sm:text-5xl mt-2 block">
              
            </span>
          </h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
            Abadikan momen seru Anda dengan strip foto klasik berukuran **2x6 inci**. Pilih frame cantik, pasang filter estetik, dan unduh langsung!
          </p>
        </div>

        {/* Visual Strip mockups */}
        <div className="flex justify-center gap-4 py-4 animate-float">
          {/* Sweet Pink mockup strip */}
          <div className="w-16 h-48 bg-gradient-to-b from-[#FFDEE9] to-[#B5FFFC] rounded-lg border border-white/20 p-1 flex flex-col justify-between shadow-lg rotate-[-6deg] hover:rotate-[0deg] transition-all duration-300">
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full aspect-[3/2] bg-white/30 rounded border border-white/20" />
              ))}
            </div>
            <div className="text-[6px] text-center text-[#7B6E8D] font-extrabold pb-1">SWEET MEMORY</div>
          </div>

          {/* Retro Cream mockup strip */}
          <div className="w-16 h-48 bg-[#F4EBE1] rounded-lg border border-[#E3D5C5] p-1 flex flex-col justify-between shadow-lg rotate-[4deg] hover:rotate-[0deg] transition-all duration-300">
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full aspect-[3/2] bg-black/5 rounded border border-black/5" />
              ))}
            </div>
            <div className="text-[6px] text-center text-[#4E3D30] font-extrabold pb-1">★ PHOTO ★</div>
          </div>
        </div>

        {/* Enter Studio Button */}
        <div className="pt-4 max-w-xs mx-auto">
          <button
            onClick={() => navigate("/camera")}
            className="w-full group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl font-bold text-white text-base shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
          >
            {/* Hover background reflection */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
            
            <Camera className="w-5 h-5 relative z-10 animate-pulse" />
            <span className="relative z-10 tracking-wide">Mulai Bilik Foto</span>
          </button>
        </div>

        {/* Features banner */}
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto pt-6 text-[10px] text-gray-500 font-medium">
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              ⚡
            </div>
            <span>Frame Kustom PNG</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <span>Zoom & Panning</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              📸
            </div>
            <span>Resolusi Tinggi</span>
          </div>
        </div>
      </div>
    </div>
  );
}

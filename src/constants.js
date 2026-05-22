// 2x6 Photobooth Constants

// Canvas dimensions for high-quality 2x6 inch strip rendering (1:3 aspect ratio)
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 1800;

// Standard photo coordinates on the 600x1800 px canvas
export const PHOTO_WIDTH = 500;
export const PHOTO_HEIGHT = 333; // ~3:2 Landscape ratio
export const PHOTO_LEFT = 50;

export const PHOTO_SLOTS = [
  { id: 0, y: 60, width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
  { id: 1, y: 433, width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
  { id: 2, y: 806, width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
  { id: 3, y: 1179, width: PHOTO_WIDTH, height: PHOTO_HEIGHT }
];

// Pre-made premium frames
export const PREMADE_FRAMES = [
  {
    id: "retro-cream",
    name: "Retro Cream",
    bgClass: "bg-[#F4EBE1]",
    canvasBg: "#F4EBE1",
    textColor: "text-[#4E3D30]",
    canvasTextColor: "#4E3D30",
    fontFamily: "serif",
    footerText: "★ MEMORIES ★",
    borderColor: "border-[#E3D5C5]",
    tagline: "CLASSIC BOOTH",
    decorations: "retro"
  },
  {
    id: "cute-pastel-pink",
    name: "Pastel Dream",
    bgClass: "bg-gradient-to-b from-[#FFDEE9] to-[#B5FFFC]",
    canvasBgGradient: ["#FFDEE9", "#B5FFFC"],
    textColor: "text-[#7B6E8D]",
    canvasTextColor: "#7B6E8D",
    fontFamily: "sans-serif",
    footerText: "♪ SWEET DAYS ♪",
    borderColor: "border-white/50",
    tagline: "LOVE & HAPPY",
    decorations: "heart"
  },
  {
    id: "cyberpunk-neon",
    name: "Cyber Neon",
    bgClass: "bg-[#0A0915] border border-cyan-500/30",
    canvasBg: "#0A0915",
    textColor: "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 font-bold",
    canvasTextColor: "#ff007f", // cyber pink
    canvasTextGlow: "#00f0ff", // cyber cyan neon outline
    fontFamily: "monospace",
    footerText: "NEON STRIP // 2026",
    borderColor: "border-cyan-500/50",
    tagline: "CYBER BOOTH",
    decorations: "neon"
  },
  {
    id: "classic-black",
    name: "Noir Black",
    bgClass: "bg-[#111111]",
    canvasBg: "#111111",
    textColor: "text-white",
    canvasTextColor: "#FFFFFF",
    fontFamily: "sans-serif",
    footerText: "SHADOWS & LIGHT",
    borderColor: "border-white/10",
    tagline: "NOIR VIBES",
    decorations: "minimal"
  }
];

// Available camera filters
export const FILTERS = [
  { id: "normal", name: "Normal", class: "" },
  { id: "mono", name: "B&W", class: "grayscale brightness-110 contrast-125" },
  { id: "vintage", name: "Vintage", class: "sepia contrast-95 brightness-95 saturate-75 hue-rotate-15" },
  { id: "warm", name: "Warm Sun", class: "saturate-125 sepia-[0.15] contrast-105" },
  { id: "cyber", name: "Cyberpunk", class: "hue-rotate-[280deg] saturate-150 contrast-110" },
  { id: "glow", name: "Dream Glow", class: "brightness-105 contrast-95 saturate-110 blur-[0.3px]" }
];

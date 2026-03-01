import { useState, useRef, useEffect, useCallback } from "react";

// --- Constants ---
const COLORS_BASIC = [
  // Reds & Pinks
  "#FF0000", "#E53935", "#C62828", "#FF5252", "#FF1744",
  "#F48FB1", "#F06292", "#EC407A", "#E91E63", "#C2185B",
  "#880E4F", "#FCE4EC", "#FFCDD2",
  // Oranges
  "#FF6D00", "#FF9100", "#FFAB40", "#FFD180", "#E65100",
  "#F4511E", "#FF7043", "#FFAB91",
  // Yellows
  "#FFD600", "#FFEA00", "#FFF176", "#FFF9C4", "#F9A825",
  "#FBC02D", "#FFD54F",
  // Greens
  "#00C853", "#69F0AE", "#00E676", "#4CAF50", "#2E7D32",
  "#1B5E20", "#81C784", "#A5D6A7", "#C8E6C9", "#00BFA5",
  "#00897B", "#004D40", "#80CBC4", "#B2DFDB",
  // Blues
  "#2979FF", "#448AFF", "#82B1FF", "#BBDEFB", "#1565C0",
  "#0D47A1", "#42A5F5", "#90CAF9", "#039BE5", "#0277BD",
  "#01579B", "#4FC3F7", "#B3E5FC",
  // Purples & Indigos
  "#AA00FF", "#D500F9", "#E040FB", "#EA80FC", "#CE93D8",
  "#6A1B9A", "#4A148C", "#304FFE", "#536DFE", "#8C9EFF",
  "#1A237E", "#283593",
  // Browns & Earth tones
  "#795548", "#6D4C41", "#5D4037", "#4E342E", "#3E2723",
  "#A1887F", "#BCAAA4", "#D7CCC8",
  // Neutrals
  "#000000", "#212121", "#424242", "#616161", "#757575",
  "#9E9E9E", "#BDBDBD", "#E0E0E0", "#EEEEEE", "#F5F5F5",
  "#FFFFFF",
];

const COLOR_CATEGORIES = {
  "Czerwone": ["#FF0000", "#E53935", "#C62828", "#FF5252", "#FF1744", "#B71C1C"],
  "Różowe": ["#F48FB1", "#F06292", "#EC407A", "#E91E63", "#C2185B", "#880E4F", "#FCE4EC", "#FFCDD2"],
  "Pomarańczowe": ["#FF6D00", "#FF9100", "#FFAB40", "#FFD180", "#E65100", "#F4511E", "#FF7043", "#FFAB91"],
  "Żółte": ["#FFD600", "#FFEA00", "#FFF176", "#FFF9C4", "#F9A825", "#FBC02D", "#FFD54F"],
  "Zielone": ["#00C853", "#69F0AE", "#00E676", "#4CAF50", "#2E7D32", "#1B5E20", "#81C784", "#A5D6A7", "#C8E6C9"],
  "Turkusowe": ["#00BFA5", "#00897B", "#004D40", "#80CBC4", "#B2DFDB", "#26A69A", "#4DB6AC"],
  "Niebieskie": ["#2979FF", "#448AFF", "#82B1FF", "#BBDEFB", "#1565C0", "#0D47A1", "#42A5F5", "#90CAF9"],
  "Błękitne": ["#039BE5", "#0277BD", "#01579B", "#4FC3F7", "#B3E5FC", "#29B6F6", "#81D4FA"],
  "Fioletowe": ["#AA00FF", "#D500F9", "#E040FB", "#EA80FC", "#CE93D8", "#6A1B9A", "#4A148C", "#B39DDB"],
  "Indygo": ["#304FFE", "#536DFE", "#8C9EFF", "#1A237E", "#283593", "#3F51B5", "#7986CB"],
  "Brązowe": ["#795548", "#6D4C41", "#5D4037", "#4E342E", "#3E2723", "#A1887F", "#BCAAA4", "#D7CCC8"],
  "Szare": ["#000000", "#212121", "#424242", "#616161", "#757575", "#9E9E9E", "#BDBDBD", "#E0E0E0", "#EEEEEE", "#F5F5F5", "#FFFFFF"],
};

const BRUSH_SIZES = [2, 5, 10, 18, 28, 40];

// --- SVG Bunny (simplified coloring page) ---
const BunnySVG = () => (
  <svg viewBox="0 0 400 500" style={{ width: "100%", height: "100%" }}>
    {/* Ears */}
    <ellipse cx="155" cy="120" rx="35" ry="90" fill="white" stroke="#333" strokeWidth="2.5" data-region="left-ear" />
    <ellipse cx="155" cy="120" rx="18" ry="70" fill="white" stroke="#333" strokeWidth="1.5" data-region="left-ear-inner" />
    <ellipse cx="245" cy="120" rx="35" ry="90" fill="white" stroke="#333" strokeWidth="2.5" data-region="right-ear" />
    <ellipse cx="245" cy="120" rx="18" ry="70" fill="white" stroke="#333" strokeWidth="1.5" data-region="right-ear-inner" />
    {/* Head */}
    <ellipse cx="200" cy="240" rx="95" ry="85" fill="white" stroke="#333" strokeWidth="2.5" data-region="head" />
    {/* Eyes */}
    <ellipse cx="170" cy="230" rx="12" ry="14" fill="#333" data-region="left-eye" />
    <ellipse cx="230" cy="230" rx="12" ry="14" fill="#333" data-region="right-eye" />
    <ellipse cx="174" cy="225" rx="4" ry="5" fill="white" />
    <ellipse cx="234" cy="225" rx="4" ry="5" fill="white" />
    {/* Nose */}
    <ellipse cx="200" cy="258" rx="8" ry="6" fill="#F48FB1" data-region="nose" />
    {/* Mouth */}
    <path d="M192 264 Q200 278 208 264" fill="none" stroke="#333" strokeWidth="2" />
    {/* Whiskers */}
    <line x1="120" y1="250" x2="165" y2="255" stroke="#333" strokeWidth="1.5" />
    <line x1="118" y1="265" x2="165" y2="262" stroke="#333" strokeWidth="1.5" />
    <line x1="235" y1="255" x2="280" y2="250" stroke="#333" strokeWidth="1.5" />
    <line x1="235" y1="262" x2="282" y2="265" stroke="#333" strokeWidth="1.5" />
    {/* Body */}
    <ellipse cx="200" cy="380" rx="85" ry="95" fill="white" stroke="#333" strokeWidth="2.5" data-region="body" />
    {/* Belly */}
    <ellipse cx="200" cy="370" rx="50" ry="55" fill="white" stroke="#333" strokeWidth="1.5" data-region="belly" />
    {/* Left paw */}
    <ellipse cx="140" cy="420" rx="25" ry="18" fill="white" stroke="#333" strokeWidth="2" data-region="left-paw" />
    {/* Right paw */}
    <ellipse cx="260" cy="420" rx="25" ry="18" fill="white" stroke="#333" strokeWidth="2" data-region="right-paw" />
    {/* Easter egg */}
    <ellipse cx="270" cy="400" rx="30" ry="40" fill="white" stroke="#333" strokeWidth="2.5" data-region="egg" />
    <path d="M245 385 Q270 375 295 385" fill="none" stroke="#333" strokeWidth="2" />
    <path d="M248 400 Q270 410 292 400" fill="none" stroke="#333" strokeWidth="2" />
    {/* Hearts on egg */}
    <path d="M260 393 C258 389 253 389 253 393 C253 396 260 400 260 400 C260 400 267 396 267 393 C267 389 262 389 260 393Z" fill="white" stroke="#333" strokeWidth="1.2" data-region="egg-heart1" />
    <path d="M278 393 C276 389 271 389 271 393 C271 396 278 400 278 400 C278 400 285 396 285 393 C285 389 280 389 278 393Z" fill="white" stroke="#333" strokeWidth="1.2" data-region="egg-heart2" />
  </svg>
);

// --- Components ---

const ToolButton = ({ icon, label, active, onClick, color }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center transition-all duration-200"
    style={{
      width: 56,
      height: 56,
      borderRadius: 16,
      background: active ? (color || "#10B981") : "rgba(255,255,255,0.9)",
      color: active ? "#fff" : "#64748B",
      border: active ? "none" : "1.5px solid #E2E8F0",
      boxShadow: active ? "0 4px 14px rgba(16,185,129,0.35)" : "0 1px 3px rgba(0,0,0,0.06)",
      fontSize: 11,
      fontWeight: 600,
      cursor: "pointer",
      letterSpacing: "0.02em",
    }}
  >
    <span style={{ fontSize: 20, marginBottom: 2 }}>{icon}</span>
    <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
  </button>
);

const ColorDot = ({ color, selected, onClick, size = 32 }) => (
  <button
    onClick={() => onClick(color)}
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      border: selected ? "3px solid #10B981" : color === "#FFFFFF" ? "1.5px solid #D1D5DB" : "2px solid transparent",
      boxShadow: selected ? "0 0 0 2px #10B981, 0 2px 8px rgba(16,185,129,0.3)" : "0 1px 3px rgba(0,0,0,0.12)",
      cursor: "pointer",
      transition: "all 0.15s ease",
      transform: selected ? "scale(1.15)" : "scale(1)",
      flexShrink: 0,
    }}
  />
);

const BrushSizeButton = ({ size, selected, onClick }) => (
  <button
    onClick={() => onClick(size)}
    className="flex items-center justify-center"
    style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: selected ? "#F0FDF4" : "#fff",
      border: selected ? "2px solid #10B981" : "1.5px solid #E2E8F0",
      cursor: "pointer",
      transition: "all 0.15s ease",
    }}
  >
    <div
      style={{
        width: Math.max(4, size * 0.7),
        height: Math.max(4, size * 0.7),
        borderRadius: "50%",
        background: selected ? "#10B981" : "#94A3B8",
      }}
    />
  </button>
);

// --- Color Palette Panel (shared between desktop sidebar & mobile drawer) ---
const ColorPaletteContent = ({ selectedColor, onSelectColor, brushSize, onSelectBrushSize, showCategories = true }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const categories = Object.entries(COLOR_CATEGORIES);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Recent / Quick colors */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Szybki wybór
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["#FF0000", "#FF6D00", "#FFD600", "#00C853", "#2979FF", "#AA00FF", "#E91E63", "#795548", "#000000", "#FFFFFF"].map(c => (
            <ColorDot key={c} color={c} selected={selectedColor === c} onClick={onSelectColor} size={36} />
          ))}
        </div>
      </div>

      {/* Category palette */}
      {showCategories && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Paleta kolorów
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {categories.map(([name, colors]) => (
              <div key={name}>
                <button
                  onClick={() => setActiveCategory(activeCategory === name ? null : name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    width: "100%",
                    background: activeCategory === name ? "#F0FDF4" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", gap: 2 }}>
                    {colors.slice(0, 5).map(c => (
                      <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: c === "#FFFFFF" ? "1px solid #ddd" : "none" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#94A3B8", transform: activeCategory === name ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                </button>
                {activeCategory === name && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 8px 4px", animation: "fadeIn 0.2s ease" }}>
                    {colors.map(c => (
                      <ColorDot key={c} color={c} selected={selectedColor === c} onClick={onSelectColor} size={30} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brush size */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Rozmiar pędzla
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {BRUSH_SIZES.map(s => (
            <BrushSizeButton key={s} size={s} selected={brushSize === s} onClick={onSelectBrushSize} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Mobile Bottom Bar Color Drawer ---
const MobileColorDrawer = ({ open, onClose, selectedColor, onSelectColor, brushSize, onSelectBrushSize }) => {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
            zIndex: 90, backdropFilter: "blur(2px)",
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}
      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "75vh",
          overflow: "auto",
          padding: "12px 20px 32px",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#D1D5DB" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>Paleta kolorów</span>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <ColorPaletteContent
          selectedColor={selectedColor}
          onSelectColor={(c) => { onSelectColor(c); }}
          brushSize={brushSize}
          onSelectBrushSize={onSelectBrushSize}
        />
      </div>
    </>
  );
};

// --- Site Header (matching twoja-kolorowanka.pl) ---
const SiteHeader = ({ compact = false }) => (
  <header style={{
    height: compact ? 52 : 64,
    background: "#fff",
    borderBottom: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: compact ? "0 12px" : "0 24px",
    flexShrink: 0,
    zIndex: 50,
  }}>
    {/* Logo */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Stylized logo mark */}
        <svg width={compact ? 28 : 36} height={compact ? 28 : 36} viewBox="0 0 36 36">
          <path d="M6 28 L10 6" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
          <path d="M10 28 L14 8" stroke="#FFB84D" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 28 L18 10" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" />
          <path d="M18 28 L22 8" stroke="#6BCB77" strokeWidth="3" strokeLinecap="round" />
          <path d="M22 28 L26 6" stroke="#4D96FF" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 28 L30 10" stroke="#9B59B6" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: compact ? 9 : 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1 }}>Twoja</div>
        <div style={{ fontSize: compact ? 15 : 18, fontWeight: 800, lineHeight: 1.1, background: "linear-gradient(135deg, #E91E63, #9C27B0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kolorowanka</div>
      </div>
    </div>

    {/* Nav (desktop only) */}
    {!compact && (
      <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <a href="#" style={{ fontSize: 14, color: "#475569", textDecoration: "none", fontWeight: 500 }}>Strona główna</a>
        <a href="#" style={{ fontSize: 14, color: "#475569", textDecoration: "none", fontWeight: 500 }}>Blog</a>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#F1F5F9", borderRadius: 10, padding: "8px 14px",
        }}>
          <span style={{ fontSize: 14, color: "#94A3B8" }}>🔍</span>
          <span style={{ fontSize: 13, color: "#94A3B8" }}>Szukaj kolorowanek</span>
        </div>
        <a href="#" style={{ fontSize: 14, color: "#475569", textDecoration: "none", fontWeight: 500 }}>Kolorowanki – lista ▾</a>
      </nav>
    )}
  </header>
);

// --- Site Footer (matching twoja-kolorowanka.pl) ---
const SiteFooter = () => (
  <footer style={{
    background: "linear-gradient(135deg, #3ECFA0, #2DB88A)",
    padding: "24px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    flexShrink: 0,
  }}>
    <div>
      <div style={{ display: "flex", gap: 20, marginBottom: 8, flexWrap: "wrap" }}>
        {["Regulamin", "Prawa autorskie", "Polityka prywatności", "RODO", "Blog"].map(link => (
          <a key={link} href="#" style={{ color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 500, opacity: 0.9 }}>{link}</a>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>© 2025 Twoja Kolorowanka. Wszystkie prawa zastrzeżone.</div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>Masz jakieś pytania lub sugestie?</div>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>
        Skontaktuj się z nami: team@twoja-kolorowanka.pl
      </div>
    </div>
  </footer>
);

// --- Main App ---
export default function ColoringPageRedesign() {
  const [tool, setTool] = useState("fill"); // fill | draw | eraser
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [brushSize, setBrushSize] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showMobileView, setShowMobileView] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleUndo = () => {/* undo logic */};
  const handleClear = () => {/* clear logic */};

  // ---- DESKTOP LAYOUT ----
  const DesktopLayout = () => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#F8FAFC",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>
    {/* Site Header */}
    <SiteHeader />

    {/* Main content row */}
    <div style={{
      display: "flex",
      flex: 1,
      overflow: "hidden",
    }}>
      {/* Left sidebar - tools & palette */}
      <div style={{
        width: 300,
        background: "#fff",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: "linear-gradient(135deg, #10B981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 18, fontWeight: 800,
            }}>🎨</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>Tryb kolorowania</div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>Twoja Kolorowanka</div>
            </div>
          </div>

          {/* Tool buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <ToolButton icon="🪣" label="Wypełnij" active={tool === "fill"} onClick={() => setTool("fill")} />
            <ToolButton icon="🖌️" label="Rysuj" active={tool === "draw"} onClick={() => setTool("draw")} />
            <ToolButton icon="◻️" label="Gumka" active={tool === "eraser"} onClick={() => setTool("eraser")} />
          </div>
        </div>

        {/* Scrollable palette area */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          <ColorPaletteContent
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            brushSize={brushSize}
            onSelectBrushSize={setBrushSize}
          />
        </div>

        {/* Current color preview */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: selectedColor,
            border: selectedColor === "#FFFFFF" ? "2px solid #E2E8F0" : "2px solid transparent",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }} />
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>Wybrany kolor</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#334155", fontFamily: "monospace" }}>{selectedColor}</div>
          </div>
        </div>
      </div>

      {/* Main canvas area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top toolbar */}
        <div style={{
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#F1F5F9", border: "none", borderRadius: 10,
              padding: "8px 14px", cursor: "pointer", color: "#475569",
              fontWeight: 600, fontSize: 13,
            }}>
              ← Powrót
            </button>
            <span style={{ color: "#CBD5E1" }}>|</span>
            <span style={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>Wielkanocny Króliczek</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Zoom controls */}
            <button onClick={handleZoomOut} style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", border: "none", cursor: "pointer", fontSize: 16, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B", minWidth: 48, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", border: "none", cursor: "pointer", fontSize: 16, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            <span style={{ color: "#E2E8F0", margin: "0 4px" }}>|</span>
            <button style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", border: "none", cursor: "pointer", fontSize: 16, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }} title="Cofnij">↩</button>
            <button style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", border: "none", cursor: "pointer", fontSize: 16, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }} title="Wyczyść">🗑</button>
            <span style={{ color: "#E2E8F0", margin: "0 4px" }}>|</span>
            <button style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "8px 16px", fontWeight: 700, fontSize: 13,
              cursor: "pointer", boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
            }}>
              💾 Zapisz
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `
            radial-gradient(circle at 20% 50%, rgba(16,185,129,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(99,102,241,0.03) 0%, transparent 50%),
            #F8FAFC
          `,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Subtle grid pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.3,
            backgroundImage: "radial-gradient(circle, #CBD5E1 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }} />

          <div
            ref={canvasRef}
            style={{
              width: 500,
              height: 600,
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
              transform: `scale(${zoom})`,
              transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              position: "relative",
              cursor: tool === "fill" ? "crosshair" : tool === "eraser" ? "cell" : "crosshair",
            }}
          >
            <BunnySVG />
          </div>
        </div>
      </div>
      </div> {/* close main content row */}

      {/* Site Footer */}
      <SiteFooter />
    </div>
  );

  // ---- MOBILE LAYOUT ----
  const MobileLayout = () => (
    <div style={{
      width: 375,
      height: 750,
      background: "#F8FAFC",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
      borderRadius: 24,
      boxShadow: "0 8px 60px rgba(0,0,0,0.15)",
      border: "8px solid #1E293B",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Site Header (compact mobile) */}
      <SiteHeader compact={true} />

      {/* Coloring toolbar row */}
      <div style={{
        height: 44,
        background: "#fff",
        borderBottom: "1px solid #F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>🎨 Wielkanocny Króliczek</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={{ background: "#F1F5F9", border: "none", borderRadius: 10, width: 32, height: 32, fontSize: 13, cursor: "pointer", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }} title="Cofnij">↩</button>
          <button style={{ background: "linear-gradient(135deg, #10B981, #059669)", border: "none", borderRadius: 10, width: 32, height: 32, fontSize: 13, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>💾</button>
        </div>
      </div>

      {/* Full screen canvas */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
        touchAction: "none",
      }}>
        <div style={{
          width: "90%",
          maxHeight: "90%",
          transform: `scale(${zoom})`,
          transition: "transform 0.3s ease",
        }}>
          <BunnySVG />
        </div>

        {/* Pinch-to-zoom hint */}
        <div style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15,23,42,0.6)",
          color: "#fff",
          fontSize: 11,
          padding: "5px 12px",
          borderRadius: 20,
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          <span>🔍</span> Rozsuń palce, aby przybliżyć
        </div>
      </div>

      {/* Bottom toolbar - floating */}
      <div style={{
        position: "absolute",
        bottom: 16,
        left: 12,
        right: 12,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        padding: "10px 12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}>
        {/* Tools */}
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => setTool("fill")}
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: tool === "fill" ? "#10B981" : "#F1F5F9",
              border: "none", cursor: "pointer",
              color: tool === "fill" ? "#fff" : "#64748B",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >🪣</button>
          <button
            onClick={() => setTool("draw")}
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: tool === "draw" ? "#10B981" : "#F1F5F9",
              border: "none", cursor: "pointer",
              color: tool === "draw" ? "#fff" : "#64748B",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >🖌️</button>
          <button
            onClick={() => setTool("eraser")}
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: tool === "eraser" ? "#10B981" : "#F1F5F9",
              border: "none", cursor: "pointer",
              color: tool === "eraser" ? "#fff" : "#64748B",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >◻️</button>
        </div>

        {/* Color picker button */}
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 14,
            background: "#F8FAFC",
            border: "1.5px solid #E2E8F0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "0 12px",
          }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: selectedColor,
            border: selectedColor === "#FFFFFF" ? "1.5px solid #D1D5DB" : "1.5px solid transparent",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Kolor</span>
          <span style={{ fontSize: 10, color: "#94A3B8" }}>▲</span>
        </button>

        {/* Zoom */}
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={handleZoomOut} style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", border: "none", cursor: "pointer", fontSize: 14, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
          <button onClick={handleZoomIn} style={{ width: 36, height: 36, borderRadius: 10, background: "#F1F5F9", border: "none", cursor: "pointer", fontSize: 14, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      </div>

      {/* Color drawer */}
      <MobileColorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedColor={selectedColor}
        onSelectColor={(c) => { setSelectedColor(c); }}
        brushSize={brushSize}
        onSelectBrushSize={setBrushSize}
      />
    </div>
  );

  // ---- RENDER ----
  return (
    <div style={{ minHeight: "100vh", background: "#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>

      {/* View toggle */}
      <div style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 1000, display: "flex", gap: 4,
        background: "rgba(30,41,59,0.9)", borderRadius: 14, padding: 4,
        backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}>
        <button
          onClick={() => setShowMobileView(false)}
          style={{
            padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            background: !showMobileView ? "#10B981" : "transparent",
            color: !showMobileView ? "#fff" : "#94A3B8",
            fontWeight: 700, fontSize: 13, fontFamily: "'Nunito', sans-serif",
          }}
        >🖥 Desktop</button>
        <button
          onClick={() => setShowMobileView(true)}
          style={{
            padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            background: showMobileView ? "#10B981" : "transparent",
            color: showMobileView ? "#fff" : "#94A3B8",
            fontWeight: 700, fontSize: 13, fontFamily: "'Nunito', sans-serif",
          }}
        >📱 Mobile</button>
      </div>

      {/* Desktop view */}
      {!showMobileView && (
        <div style={{ paddingTop: 56 }}>
          <DesktopLayout />
        </div>
      )}

      {/* Mobile view (phone frame) */}
      {showMobileView && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          paddingTop: 56,
        }}>
          <MobileLayout />
        </div>
      )}
    </div>
  );
}

import { motion } from "motion/react";
import { ReactNode, useRef, useState, useCallback } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  tilt?: boolean;
}

export function GlassCard({ children, className = "", hover = true, glow = false, tilt = false }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });

    if (tilt) {
      const tiltX = (x - 0.5) * 12;
      const tiltY = (y - 0.5) * -12;
      ref.current.style.transform = `perspective(800px) rotateY(${tiltX}deg) rotateX(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    }
  }, [tilt]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePos({ x: 0.5, y: 0.5 });
    if (tilt && ref.current) {
      ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)";
    }
  }, [tilt]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 800);
  }, []);

  return (
    <motion.div
      ref={ref}
      whileHover={hover && !tilt ? { y: -8, transition: { type: "spring", stiffness: 400, damping: 22 } } : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`group relative rounded-2xl p-[1px] will-change-transform ${className}`}
      style={{
        ...(glow ? { boxShadow: isHovered ? "0 0 60px rgba(60,56,189,0.25), 0 0 120px rgba(126,122,232,0.1)" : "0 0 40px rgba(60,56,189,0.08)" } : {}),
        ...(tilt ? { transition: "transform 0.12s cubic-bezier(0.23, 1, 0.32, 1)" } : {}),
      }}
    >
      {/* Animated gradient border — follows cursor */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0.3,
          background: `conic-gradient(from ${Math.atan2(mousePos.y - 0.5, mousePos.x - 0.5) * (180 / Math.PI)}deg at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(60,56,189,0.6), rgba(126,122,232,0.4), transparent 40%, transparent 60%, rgba(60,56,189,0.3))`,
        }}
      />

      {/* Mouse-following spotlight glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(126,122,232,0.15), rgba(60,56,189,0.05) 40%, transparent 70%)`,
        }}
      />

      {/* Card inner — glassmorphism */}
      <div
        className="relative rounded-2xl p-6 h-full overflow-hidden"
        style={{
          background: `linear-gradient(145deg, rgba(22,21,60,0.85), rgba(0,0,0,0.92))`,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 -1px 0 0 rgba(255,255,255,0.02)`,
        }}
      >
        {/* Inner reactive dot noise */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(126,122,232,0.8) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Reactive inner highlight that follows cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-400"
          style={{
            opacity: isHovered ? 0.6 : 0,
            background: `radial-gradient(250px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(126,122,232,0.08), transparent 60%)`,
          }}
        />

        {/* Click ripple effects */}
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{ left: ripple.x, top: ripple.y, x: "-50%", y: "-50%" }}
            initial={{ width: 0, height: 0, opacity: 0.4 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-full h-full rounded-full bg-[#7E7AE8]/20" />
          </motion.div>
        ))}

        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}

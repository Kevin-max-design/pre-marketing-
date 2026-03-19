import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect, useCallback } from "react";

export function GridBackground({ parallax = true }: { parallax?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", parallax ? "30%" : "0%"]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-auto" style={{ zIndex: 0 }}>
      {/* Parallax grid */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(60,56,189,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(60,56,189,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(126,122,232,0.7) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </motion.div>

      {/* Mouse-reactive radial spotlight */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(60,56,189,0.07), transparent 50%)`,
        }}
      />

      {/* Secondary spotlight — offset and delayed */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x * 80 + 10}% ${mousePos.y * 80 + 10}%, rgba(126,122,232,0.04), transparent 50%)`,
        }}
      />

      {/* Radial fades */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, transparent 0%, #000000 70%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 100%, transparent 0%, #000000 70%)" }} />
    </div>
  );
}

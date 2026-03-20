import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { supabase } from "@/lib/supabase";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "motion/react";
import { GlassCard } from "../components/GlassCard";
import { GridBackground } from "../components/GridBackground";
import {
  Shield, UserCheck, Coins, Lock as LockIcon, Sparkles, ArrowRight, CheckCircle,
  Zap, Eye, Send, Star, TrendingUp, Terminal, Activity,
  Cpu, Database, Globe, ChevronRight, ArrowUpRight, Quote,
  BarChart3, Rocket, Users, DollarSign, Code2, Layers
} from "lucide-react";

/* ─── Reusable Animation Wrappers ─── */

function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerChildren({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Text Animations ─── */

function InteractiveText({ text, rawX, rawY, className = "" }: { text: string; rawX: number; rawY: number; className?: string }) {
  // Split by words then letters to preserve word wrapping
  const words = text.split(" ");
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-flex whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, cIdx) => {
            const ref = useRef<HTMLSpanElement>(null);
            const [offset, setOffset] = useState({ x: 0, y: 0, scale: 1, color: "inherit" });

            useEffect(() => {
              if (!ref.current) return;
              const rect = ref.current.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;

              const dx = rawX - centerX;
              const dy = rawY - centerY;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 120 && dist > 1) {
                const force = (120 - dist) / 120;
                setOffset({
                  x: -(dx / dist) * force * 15,
                  y: -(dy / dist) * force * 15,
                  scale: 1 + force * 0.15,
                  color: "#EBEDEF"
                });
              } else {
                setOffset({ x: 0, y: 0, scale: 1, color: "inherit" });
              }
            }, [rawX, rawY]);

            return (
              <motion.span
                key={cIdx}
                ref={ref}
                className="inline-block transition-colors duration-200"
                style={{ color: offset.color }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: offset.y, x: offset.x, scale: offset.scale }}
                transition={{
                  y: { type: "spring", stiffness: 400, damping: 25 },
                  x: { type: "spring", stiffness: 400, damping: 25 },
                  scale: { type: "spring", stiffness: 400, damping: 25 },
                  opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: (wIdx * 5 + cIdx) * 0.02 }
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

function SplitTextReveal({ text, className = "", style = {} }: { text: string; className?: string; style?: React.CSSProperties }) {
  const words = text.split(" ");
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
      className={className}
      style={style}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function TypewriterText({ text, className = "", speed = 40 }: { text: string; className?: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [inView, text, speed]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="text-[#7E7AE8]">|</motion.span>
    </span>
  );
}

/* ─── Animated Counter (scroll-triggered) ─── */

function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = springVal.on("change", (v) => setDisplay(v.toFixed(decimals)));
    return unsub;
  }, [springVal, decimals]);

  return (
    <span ref={ref}>
      {prefix}{Number(display).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

/* ─── Continuous Scrolling Marquee ─── */

function InfiniteMarquee({ items, speed = 30, reverse = false }: { items: { icon: any; label: string }[]; speed?: number; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to right, #000000, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to left, #000000, transparent)" }} />
      <motion.div
        className="flex gap-12 items-center whitespace-nowrap py-5"
        animate={{ x: reverse ? ["0%", "-33.33%"] : ["-33.33%", "0%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0 group hover:scale-110 transition-transform cursor-pointer">
            <item.icon size={15} className="text-[#3C38BD]/50 group-hover:text-[#7E7AE8] transition-colors" />
            <span className="text-[#555] group-hover:text-[#EBEDEF] transition-colors" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em" }}>{item.label.toUpperCase()}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Parallax Section Wrapper ─── */

function ParallaxSection({ children, className = "", speed = 0.15, bg }: { children: ReactNode; className?: string; speed?: number; bg?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}px`, `${speed * 100}px`]);

  return (
    <section ref={ref} className={`relative overflow-hidden ${className}`} style={bg ? { background: bg } : undefined}>
      <motion.div style={{ y }} className="relative">
        {children}
      </motion.div>
    </section>
  );
}

/* ─── Floating Particles ─── */

function FloatingParticles({ mouseX = 0.5, mouseY = 0.5 }: { mouseX?: number; mouseY?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => {
        // Calculate dynamic repulse based on mouse position
        const baseX = Math.random() * 100;
        const baseY = Math.random() * 100;
        const distToMouse = Math.sqrt(Math.pow(baseX - mouseX * 100, 2) + Math.pow(baseY - mouseY * 100, 2));
        const repulseFactor = Math.max(0, 15 - distToMouse) * 2;
        const moveX = (baseX > mouseX * 100 ? repulseFactor : -repulseFactor);
        const moveY = (baseY > mouseY * 100 ? repulseFactor : -repulseFactor);

        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${i % 3 === 0 ? 'w-1.5 h-1.5 bg-[#7E7AE8]/25' : i % 3 === 1 ? 'w-1 h-1 bg-[#3C38BD]/30' : 'w-0.5 h-0.5 bg-[#EBEDEF]/15'}`}
            style={{ left: `${baseX}%`, top: `${baseY}%` }}
            animate={{ 
              y: [moveY, moveY - (20 + Math.random() * 40), moveY], 
              x: [moveX, moveX + (Math.random() - 0.5) * 20, moveX],
              opacity: [0.05, 0.6, 0.05], 
              scale: [0.3, 1.2, 0.3] 
            }}
            transition={{ duration: 3 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 4, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

/* ─── Floating Terminal ─── */

function FloatingTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rotate = useTransform(scrollYProgress, [0, 1], [2, -2]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ y, rotate }}
      className="hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 w-[360px]"
    >
      <div
        className="rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl"
        style={{ background: "rgba(10,14,26,0.92)", backdropFilter: "blur(24px)", boxShadow: "0 0 60px rgba(108,142,255,0.06)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[#444] ml-2" style={{ fontSize: "11px", fontFamily: "monospace" }}>starthub-cli v2.1</span>
        </div>
        <div className="p-5 space-y-2.5" style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: 2 }}>
          <div><span className="text-[#6C8EFF]">$</span> <TypewriterText text="starthub deploy --secure --prod" className="text-[#8A8A9A]" speed={35} /></div>
          {[
            { text: "Verified investor match", delay: 2.5 },
            { text: "Access request encrypted (AES-256)", delay: 3.2 },
            { text: "Deal flow secured", delay: 3.9 },
          ].map((line, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: line.delay, duration: 0.4 }}>
              <span className="text-[#22c55e]">✓</span> <span className="text-[#8A8A9A]">{line.text}</span>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.6, duration: 0.5 }}>
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-[#38BDF8]">→</motion.span>{" "}
            <span className="text-white" style={{ fontWeight: 600 }}>$150K raised privately</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ HERO ═══ */

function HeroSection({ stats }: { stats: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5, rawX: 0, rawY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth springs for 3D tilt effect and parallax
  const springConfig = { stiffness: 150, damping: 20 };
  const tiltX = useSpring(useTransform(useMotionValue(0.5), [0, 1], [25, -25]), springConfig);
  const tiltY = useSpring(useTransform(useMotionValue(0.5), [0, 1], [-25, 25]), springConfig);
  
  // High-fidelity trailing cursor physics
  const cursorX = useSpring(0, { stiffness: 400, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 400, damping: 28 });
  const cursorScale = useSpring(1, { stiffness: 300, damping: 20 });
  const cursorOpacity = useSpring(0, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y, rawX: e.clientX - rect.left, rawY: e.clientY - rect.top });
    
    // Update tilt values based on mouse position
    tiltX.set(y);
    tiltY.set(x);

    // Update cursor
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex items-center overflow-hidden cursor-none" 
      style={{ perspective: "1200px" }} 
      onMouseMove={handleMouseMove} 
      onMouseEnter={() => { setIsHovered(true); cursorOpacity.set(1); }} 
      onMouseLeave={() => { setIsHovered(false); cursorOpacity.set(0); }}
      onMouseDown={() => cursorScale.set(0.5)}
      onMouseUp={() => cursorScale.set(1)}
    >
      <GridBackground parallax />
      <FloatingParticles mouseX={mousePos.x} mouseY={mousePos.y} />

      {/* Trailing Fluid Cursor */}
      <motion.div
        className="absolute w-4 h-4 rounded-full pointer-events-none z-50 mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(235,237,239,1) 0%, rgba(126,122,232,0.8) 50%, rgba(60,56,189,0) 100%)",
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          scale: cursorScale,
          opacity: cursorOpacity,
          boxShadow: "0 0 20px rgba(126,122,232,0.6)",
        }}
      />

      {/* Mouse-reactive gradient orbs */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: bgY }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ 
            background: "rgba(60,56,189,0.18)",
            left: `${mousePos.x * 30 + 5}%`,
            top: `${mousePos.y * 30}%`,
            transition: "left 1.5s ease-out, top 1.5s ease-out",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ 
            background: "rgba(126,122,232,0.15)",
            right: `${(1 - mousePos.x) * 20}%`,
            bottom: `${(1 - mousePos.y) * 20}%`,
            transition: "right 2s ease-out, bottom 2s ease-out",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "rgba(60,56,189,0.08)" }}
        />

        {/* Stronger cursor-following orb */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: isHovered ? "600px" : "300px",
            height: isHovered ? "600px" : "300px",
            filter: "blur(70px)",
            background: `radial-gradient(circle, rgba(126,122,232,0.25) 0%, rgba(60,56,189,0.08) 40%, transparent 100%)`,
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            transform: "translate(-50%, -50%)",
            transition: "width 0.4s ease-out, height 0.4s ease-out, left 0.1s ease-out, top 0.1s ease-out",
          }}
        />
      </motion.div>

      <motion.div
        style={{ 
          opacity: contentOpacity, 
          y: contentY,
          rotateX: isHovered ? tiltX : 0,
          rotateY: isHovered ? tiltY : 0,
          transformStyle: "preserve-3d"
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full"
      >
        <div className="max-w-2xl" style={{ transform: "translateZ(40px)" }}>
          <FadeUp>
            <motion.div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#3C38BD]/30 mb-8"
              style={{ background: "rgba(60,56,189,0.08)", backdropFilter: "blur(12px)" }}
              animate={{ boxShadow: ["0 0 0px rgba(60,56,189,0)", "0 0 30px rgba(60,56,189,0.15)", "0 0 0px rgba(60,56,189,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              whileHover={{ scale: 1.05, borderColor: "rgba(126,122,232,0.5)" }}
            >
              <motion.div className="w-2 h-2 rounded-full bg-[#7E7AE8]" animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[#7E7AE8]" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em" }}>PRIVATE PILOT — LIMITED ACCESS</span>
            </motion.div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="mb-6" style={{ fontSize: "clamp(42px, 5.5vw, 76px)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.04em" }}>
              <InteractiveText text="The Private" rawX={mousePos.rawX} rawY={mousePos.rawY} className="text-white block" />
              <motion.span
                className="bg-gradient-to-r from-[#3C38BD] via-[#7E7AE8] to-[#3C38BD] bg-clip-text text-transparent block"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% auto" }}
              >
                <InteractiveText text="Micro-Investing" rawX={mousePos.rawX} rawY={mousePos.rawY} />
              </motion.span>
              <InteractiveText text="Platform" rawX={mousePos.rawX} rawY={mousePos.rawY} className="text-white block" />
            </h1>
          </FadeUp>

          <FadeUp delay={0.25}>
            <p className="text-[#8A8A9A] max-w-lg mb-10" style={{ fontSize: "17px", lineHeight: 1.7 }}>
              Founder-controlled access meets verified investor capital.
              Raise privately, invest early, start small — all on one secure platform.
            </p>
          </FadeUp>

          <FadeUp delay={0.35}>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link to="/signup/founder" className="group relative px-8 py-4 rounded-xl overflow-hidden" style={{ fontSize: "15px", fontWeight: 600 }}>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8]" whileHover={{ boxShadow: "0 0 60px rgba(60,56,189,0.5)" }} />
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} />
                <span className="relative text-white flex items-center gap-2">Start Raising Capital <ArrowRight size={16} /></span>
              </Link>
              <Link
                to="/signup/investor"
                className="group px-8 py-4 rounded-xl border border-[#3C38BD]/20 text-[#D2D2D2] hover:text-white hover:border-[#7E7AE8]/40 hover:bg-[#3C38BD]/[0.05] transition-all flex items-center gap-2"
                style={{ fontSize: "15px", fontWeight: 500, backdropFilter: "blur(12px)" }}
              >
                Explore as Investor <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="mt-16 flex flex-wrap items-center gap-10">
              {[
                { value: stats.founders, suffix: "+", label: "Active Founders", icon: Rocket },
                { value: stats.capital / 1000, suffix: "K", label: "Capital Raised", prefix: "$", decimals: 1, icon: DollarSign },
                { value: stats.investors, suffix: "+", label: "Verified Investors", icon: Users },
                { value: 0, suffix: "%", label: "Uptime", decimals: 1, icon: Activity },
              ].map((stat) => (
                <motion.div key={stat.label} className="flex items-center gap-3" whileHover={{ scale: 1.08, y: -3 }} transition={{ type: "spring", stiffness: 400 }}>
                  <motion.div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center" 
                    style={{ background: "rgba(60,56,189,0.1)", border: "1px solid rgba(60,56,189,0.15)", backdropFilter: "blur(8px)" }}
                    whileHover={{ boxShadow: "0 0 20px rgba(126,122,232,0.3)", borderColor: "rgba(126,122,232,0.4)" }}
                  >
                    <stat.icon size={14} className="text-[#7E7AE8]/70" />
                  </motion.div>
                  <div>
                    <div className="text-white" style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em", fontFeatureSettings: "'tnum'" }}>
                      <AnimatedNumber value={stat.value} prefix={stat.prefix || ""} suffix={stat.suffix} decimals={stat.decimals || 0} />
                    </div>
                    <div className="text-[#444]" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em" }}>{stat.label.toUpperCase()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>

        <FloatingTerminal />
      </motion.div>
    </section>
  );
}

/* ═══ TRUST MARQUEE ═══ */

function TrustMarquee() {
  const row1 = [
    { icon: LockIcon, label: "End-to-End Encrypted" }, { icon: Shield, label: "SOC 2 Compliant" },
    { icon: Activity, label: "99.99% Uptime SLA" }, { icon: Database, label: "Zero Data Leaks" },
    { icon: Globe, label: "Global Infrastructure" }, { icon: Code2, label: "Open API" },
    { icon: Layers, label: "Multi-Layer Security" }, { icon: Cpu, label: "AI-Powered Matching" },
  ];
  const row2 = [
    { icon: BarChart3, label: "Real-Time Analytics" }, { icon: UserCheck, label: "KYC Verified" },
    { icon: Zap, label: "Instant Notifications" }, { icon: Terminal, label: "Developer SDK" },
    { icon: Star, label: "4.9/5 Rating" }, { icon: TrendingUp, label: "Growth Tracking" },
    { icon: Eye, label: "Privacy Controls" }, { icon: Rocket, label: "Fast Onboarding" },
  ];

  return (
    <section className="py-8 border-y border-white/[0.03]" style={{ background: "#060914" }}>
      <InfiniteMarquee items={row1} speed={40} />
      <InfiniteMarquee items={row2} speed={35} reverse />
    </section>
  );
}

/* ═══ FEATURES ═══ */

function FeaturesSection() {
  const features = [
    { icon: Shield, title: "Founder Privacy", description: "Startups stay invisible until founders explicitly grant investor access. Full control over who sees your data, pitch, and metrics.", tag: "PRIVACY" },
    { icon: UserCheck, title: "Verified Investors", description: "Multi-step KYC verification ensures every investor is vetted before they can browse or request access to any startup.", tag: "SECURITY" },
    { icon: Coins, title: "Micro Investments", description: "Investments starting at $500. We're lowering the barrier for early-stage funding so more founders get funded.", tag: "ACCESS" },
    { icon: Eye, title: "Private Deal Flow", description: "Zero public listings. Every deal is private, encrypted, and accessible only through founder-approved channels.", tag: "DEALS" },
    { icon: Sparkles, title: "AI Smart Matching", description: "Proprietary algorithm connects founders with investors based on industry, stage, thesis, and investment preferences.", tag: "AI" },
    { icon: Cpu, title: "Real-Time Analytics", description: "Live dashboards tracking investor engagement, profile views, match probability, and deal conversion rates.", tag: "DATA" },
  ];

  return (
    <ParallaxSection className="py-28" speed={0.05}>
      <GridBackground parallax={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="max-w-xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6C8EFF]/15 mb-6" style={{ background: "rgba(108,142,255,0.06)", backdropFilter: "blur(8px)" }}>
            <Terminal size={12} className="text-[#6C8EFF]" />
            <span className="text-[#6C8EFF]" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>PLATFORM FEATURES</span>
          </div>
          <h2 className="text-white mb-5" style={{ fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08 }}>
            <SplitTextReveal text="Infrastructure built for" />{" "}
            <span className="bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] bg-clip-text text-transparent">privacy-first</span>{" "}
            <SplitTextReveal text="fundraising" />
          </h2>
          <p className="text-[#8A8A9A]" style={{ fontSize: "16px", lineHeight: 1.7 }}>Enterprise-grade security meets startup simplicity.</p>
        </FadeUp>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <GlassCard className="h-full" tilt>
                <div className="flex items-center justify-between mb-5">
                  <motion.div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(108,142,255,0.08)", border: "1px solid rgba(108,142,255,0.1)", backdropFilter: "blur(8px)" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon size={18} className="text-[#6C8EFF]" />
                  </motion.div>
                  <span className="px-2.5 py-1 rounded-md text-[#555]" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", background: "rgba(255,255,255,0.03)" }}>{feature.tag}</span>
                </div>
                <h3 className="text-white mb-2.5" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>{feature.title}</h3>
                <p className="text-[#8A8A9A]" style={{ fontSize: "13.5px", lineHeight: 1.65 }}>{feature.description}</p>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </ParallaxSection>
  );
}

/* ═══ STATS ═══ */

function StatsSection({ stats }: { stats: any }) {
  const displayStats = [
    { value: stats.capital / 1000, suffix: "K+", label: "Total Funding Raised", prefix: "$" },
    { value: 0, suffix: "%", label: "Founder Satisfaction" },
    { value: 0, suffix: "x", label: "Faster Than Traditional", decimals: 1 },
    { value: stats.deals, suffix: "+", label: "Private Deals Closed" },
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "#060914" }}>
      <FloatingParticles />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerChildren className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="text-center">
                <div
                  className="bg-gradient-to-b from-[#6C8EFF] to-[#6C8EFF]/35 bg-clip-text text-transparent"
                  style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, fontFeatureSettings: "'tnum'" }}
                >
                  <AnimatedNumber value={stat.value} prefix={stat.prefix || ""} suffix={stat.suffix} decimals={stat.decimals || 0} />
                </div>
                <p className="text-[#555] mt-2" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em" }}>{stat.label.toUpperCase()}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

/* ═══ HOW IT WORKS ═══ */

function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<"founder" | "investor">("founder");

  const founderSteps = [
    { step: "01", title: "Submit Startup", desc: "Create an encrypted startup profile with your pitch, metrics, and funding requirements.", icon: Terminal },
    { step: "02", title: "Stay Private", desc: "Your identity and data remain hidden. Only masked profiles are visible.", icon: LockIcon },
    { step: "03", title: "Review & Approve", desc: "Evaluate investor profiles and investment theses before granting access.", icon: UserCheck },
    { step: "04", title: "Raise Capital", desc: "Connect directly, negotiate, and raise capital through secure channels.", icon: TrendingUp },
  ];

  const investorSteps = [
    { step: "01", title: "Browse Feed", desc: "Explore AI-curated masked startup profiles filtered by industry and stage.", icon: Eye },
    { step: "02", title: "Request Access", desc: "Submit verified requests with your investment thesis and background.", icon: Send },
    { step: "03", title: "Get Approved", desc: "Founders review your profile. Approval unlocks full startup details.", icon: CheckCircle },
    { step: "04", title: "Invest Privately", desc: "Access full deal room and invest through encrypted channels.", icon: Coins },
  ];

  const steps = activeTab === "founder" ? founderSteps : investorSteps;

  return (
    <ParallaxSection className="py-28" speed={0.06} bg="#060914">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: "linear-gradient(rgba(108,142,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,142,255,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6C8EFF]/15 mb-6" style={{ background: "rgba(108,142,255,0.06)", backdropFilter: "blur(8px)" }}>
            <Activity size={12} className="text-[#6C8EFF]" />
            <span className="text-[#6C8EFF]" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>WORKFLOW</span>
          </div>
          <h2 className="text-white mb-5" style={{ fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08 }}>
            <SplitTextReveal text="How the platform" />{" "}
            <span className="bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] bg-clip-text text-transparent">works</span>
          </h2>
          <p className="text-[#8A8A9A] max-w-xl mx-auto mb-10" style={{ fontSize: "16px", lineHeight: 1.7 }}>A streamlined, secure workflow for both sides of the deal.</p>

          <div className="inline-flex rounded-xl border border-white/[0.06] p-1" style={{ background: "rgba(10,14,26,0.8)", backdropFilter: "blur(12px)" }}>
            {(["founder", "investor"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-7 py-2.5 rounded-lg transition-all relative ${activeTab === tab ? "text-white" : "text-[#8A8A9A] hover:text-white"}`} style={{ fontSize: "13px", fontWeight: 600 }}>
                {activeTab === tab && <motion.div layoutId="hiw-tab" className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8]" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
                <span className="relative">For {tab === "founder" ? "Founders" : "Investors"}</span>
              </button>
            ))}
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          <div className="hidden lg:block absolute top-[72px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#6C8EFF]/15 to-transparent" />
          {steps.map((step, index) => (
            <motion.div
              key={`${activeTab}-${step.step}`}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard hover={false} className="h-full">
                <div className="flex items-center justify-between mb-5">
                  <motion.div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(108,142,255,0.08)", border: "1px solid rgba(108,142,255,0.1)" }} whileHover={{ scale: 1.1 }}>
                    <step.icon size={18} className="text-[#6C8EFF]" />
                  </motion.div>
                  <span className="text-[#6C8EFF]/15" style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-0.04em" }}>{step.step}</span>
                </div>
                <h4 className="text-white mb-2" style={{ fontSize: "15px", fontWeight: 700 }}>{step.title}</h4>
                <p className="text-[#8A8A9A]" style={{ fontSize: "13px", lineHeight: 1.65 }}>{step.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </ParallaxSection>
  );
}

/* ═══ PRICING ═══ */

function PricingSection() {
  const plans = [
    { name: "Starter", price: 0, period: "forever", desc: "Explore the platform", features: ["Browse masked startups", "1 access request/month", "Basic profile", "Community support"], cta: "Get Started", highlighted: false },
    { name: "Pro", price: 29, period: "/month", desc: "For active investors", features: ["Unlimited access requests", "AI Smart Matching", "Priority support", "Advanced filters", "Deal analytics dashboard", "Direct messaging"], cta: "Start Free Trial", highlighted: true },
    { name: "Founder", price: 19, period: "/month", desc: "For startups raising", features: ["Private encrypted profile", "Investor management", "Real-time analytics", "In-app messaging", "Funding tracker"], cta: "Launch Startup", highlighted: false },
  ];

  return (
    <ParallaxSection className="py-28" speed={0.04}>
      <GridBackground parallax={false} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6C8EFF]/15 mb-6" style={{ background: "rgba(108,142,255,0.06)", backdropFilter: "blur(8px)" }}>
            <Zap size={12} className="text-[#6C8EFF]" />
            <span className="text-[#6C8EFF]" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>PRICING</span>
          </div>
          <h2 className="text-white mb-5" style={{ fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            <SplitTextReveal text="Transparent pricing" />
          </h2>
          <p className="text-[#8A8A9A]" style={{ fontSize: "16px" }}>Start free. Scale when ready. No hidden fees.</p>
        </FadeUp>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <StaggerItem key={plan.name}>
              <GlassCard tilt glow={plan.highlighted} className="h-full">
                <div className="flex flex-col h-full min-h-[420px]">
                  {plan.highlighted && (
                    <motion.div 
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[#6C8EFF] mb-5 self-start shadow-[0_0_15px_rgba(108,142,255,0.3)]"
                      style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", background: "rgba(108,142,255,0.15)", border: "1px solid rgba(108,142,255,0.3)" }}
                      animate={{ boxShadow: ["0 0 10px rgba(108,142,255,0.2)", "0 0 25px rgba(108,142,255,0.6)", "0 0 10px rgba(108,142,255,0.2)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star size={11} className="animate-pulse" /> MOST POPULAR
                    </motion.div>
                  )}
                  <h3 className="text-white mb-1" style={{ fontSize: "18px", fontWeight: 700 }}>{plan.name}</h3>
                  <p className="text-[#555] mb-5" style={{ fontSize: "13px" }}>{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-white" style={{ fontSize: "48px", fontWeight: 900, letterSpacing: "-0.04em", fontFeatureSettings: "'tnum'" }}>
                      $<AnimatedNumber value={plan.price} />
                    </span>
                    <span className="text-[#555] ml-1" style={{ fontSize: "14px" }}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, idx) => (
                      <motion.li 
                        key={f} 
                        className="flex items-start gap-2.5" 
                        style={{ fontSize: "13.5px" }}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * idx, duration: 0.4 }}
                      >
                        <CheckCircle size={15} className="text-[#6C8EFF] shrink-0 mt-0.5" />
                        <span className="text-[#8A8A9A]">{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${plan.highlighted ? "text-white shadow-[0_0_20px_rgba(108,142,255,0.2)]" : "border border-[#6C8EFF]/20 text-[#D2D2D2] hover:border-[#6C8EFF]/60 hover:text-white"}`}
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    {plan.highlighted && <div className="absolute inset-0 bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] z-0" />}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10" />
                    <span className="relative z-20">{plan.cta}</span>
                  </motion.button>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </ParallaxSection>
  );
}

/* ═══ TESTIMONIALS ═══ */

function TestimonialsSection() {
  const testimonials = [
    { quote: "StartHub changed how we raise capital. The privacy-first approach meant we could be selective about who sees our startup.", name: "James Liu", title: "CEO, NovaPay", raised: "$200K" },
    { quote: "The AI matching is incredibly accurate. I've found 3 startups through StartHub that I wouldn't have discovered elsewhere.", name: "Priya Sharma", title: "Angel Investor", raised: "8 Deals" },
    { quote: "Finally a platform that puts founders in control. No more cold outreach from unqualified investors.", name: "Marcus Chen", title: "CTO, DataMesh", raised: "$350K" },
  ];

  return (
    <ParallaxSection className="py-28" speed={0.05} bg="#060914">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6C8EFF]/15 mb-6" style={{ background: "rgba(108,142,255,0.06)", backdropFilter: "blur(8px)" }}>
            <Quote size={12} className="text-[#6C8EFF]" />
            <span className="text-[#6C8EFF]" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>TESTIMONIALS</span>
          </div>
          <h2 className="text-white" style={{ fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            <SplitTextReveal text="Trusted by founders & investors" />
          </h2>
        </FadeUp>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <GlassCard hover={false} className="h-full" tilt>
                <Quote size={20} className="text-[#6C8EFF]/15 mb-5" />
                <p className="text-[#D2D2D2] mb-6" style={{ fontSize: "14px", lineHeight: 1.75 }}>"{t.quote}"</p>
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.04]">
                  <div>
                    <p className="text-white" style={{ fontSize: "14px", fontWeight: 600 }}>{t.name}</p>
                    <p className="text-[#555]" style={{ fontSize: "12px" }}>{t.title}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[#6C8EFF]" style={{ fontSize: "12px", fontWeight: 700, background: "rgba(108,142,255,0.08)", border: "1px solid rgba(108,142,255,0.1)" }}>{t.raised}</span>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </ParallaxSection>
  );
}

/* ═══ CTA / WAITLIST ═══ */

function WaitlistSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", city: "" });
  
  const inputCls = "w-full px-4 py-4 rounded-xl text-white placeholder-[#333] focus:outline-none focus:ring-1 focus:ring-[#6C8EFF]/30 transition-all";
  const inputStyle: React.CSSProperties = { fontSize: "14px", background: "rgba(10,14,26,0.8)", border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      alert("Please select your role");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from(formData.role)
        .insert([{ email: formData.email, status: 'active' }]);
      
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      alert("Error joining waitlist: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxSection className="py-28" speed={0.04}>
      <GridBackground parallax={false} />
      <FloatingParticles />
      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        <FadeUp>
          <h2 className="text-white mb-5" style={{ fontSize: "clamp(30px, 3.5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            <SplitTextReveal text="Ready to join the" />{" "}
            <motion.span
              className="bg-gradient-to-r from-[#6C8EFF] via-[#38BDF8] to-[#6C8EFF] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% auto" }}
            >
              private pilot
            </motion.span>
            ?
          </h2>
          <p className="text-[#8A8A9A] mb-10" style={{ fontSize: "16px", lineHeight: 1.7 }}>Be among the first to access StartHub. Limited spots available.</p>
        </FadeUp>

        {!submitted ? (
          <FadeUp delay={0.1}>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  className={inputCls} 
                  style={inputStyle} 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  className={inputCls} 
                  style={inputStyle} 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select 
                  className={`${inputCls} appearance-none`} 
                  style={inputStyle} 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="" disabled>I am a...</option>
                  <option value="founder">Founder</option>
                  <option value="investor">Investor</option>
                </select>
                <input 
                  type="text" 
                  placeholder="City" 
                  className={inputCls} 
                  style={inputStyle} 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <motion.button 
                type="submit" 
                disabled={loading}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.98 }} 
                className="group relative w-full py-4 rounded-xl overflow-hidden disabled:opacity-50" 
                style={{ fontSize: "15px", fontWeight: 600 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] transition-all group-hover:shadow-[0_0_50px_rgba(108,142,255,0.3)]" />
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }} />
                <span className="relative text-white flex items-center justify-center gap-2">
                  {loading ? "Joining..." : "Join the Waitlist"} <ArrowRight size={16} />
                </span>
              </motion.button>
              <p className="text-[#333] mt-2" style={{ fontSize: "12px" }}>No spam. We'll only email you when your invite is ready.</p>
            </form>
          </FadeUp>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="py-16">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(108,142,255,0.1)", border: "1px solid rgba(108,142,255,0.15)" }}>
              <CheckCircle size={32} className="text-[#6C8EFF]" />
            </motion.div>
            <h3 className="text-white mb-2" style={{ fontSize: "22px", fontWeight: 700 }}>You're on the list</h3>
            <p className="text-[#8A8A9A]" style={{ fontSize: "14px" }}>We'll notify you when your invite is ready.</p>
          </motion.div>
        )}
      </div>
    </ParallaxSection>
  );
}

/* ═══ FOOTER ═══ */

function Footer() {
  const columns = [
    { title: "Product", links: ["Features", "Pricing", "Security", "Changelog"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
  ];

  return (
    <footer className="border-t border-white/[0.03]" style={{ background: "#050812" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C8EFF] to-[#38BDF8] flex items-center justify-center">
                <span className="text-white" style={{ fontSize: "13px", fontWeight: 800 }}>S</span>
              </div>
              <span className="text-white" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em" }}>StartHub</span>
            </div>
            <p className="text-[#555] max-w-xs mb-6" style={{ fontSize: "13px", lineHeight: 1.6 }}>The private micro-investment platform connecting founders and verified investors.</p>
            <div className="flex gap-2.5">
              {["X", "LI", "GH"].map((s) => (
                <motion.a key={s} href="#" whileHover={{ scale: 1.1, y: -2 }} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.04)", fontSize: "11px", fontWeight: 700 }}>
                  {s}
                </motion.a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[#555] mb-4" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }}>{col.title.toUpperCase()}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}><a href="#" className="text-[#8A8A9A] hover:text-white transition-colors" style={{ fontSize: "13px" }}>{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/[0.03] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#333]" style={{ fontSize: "12px" }}>&copy; 2026 StartHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[#555]" style={{ fontSize: "12px" }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══ PAGE ═══ */

export function LandingPage() {
  const [stats, setStats] = useState({ founders: 0, investors: 0, capital: 0, deals: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { data: profiles } = await supabase.from('profiles').select('role');
      const { data: startups } = await supabase.from('startups').select('funding_needed');
      const { data: deals } = await supabase.from('access_requests').select('id').eq('status', 'approved');

      const foundersCount = profiles?.filter((p: any) => p.role === 'FOUNDER').length || 0;
      const investorsCount = profiles?.filter((p: any) => p.role === 'INVESTOR').length || 0;
      const totalCapital = startups?.reduce((acc: number, curr: any) => {
        const val = parseFloat(curr.funding_needed.replace(/[^0-9.]/g, '')) || 0;
        return acc + val;
      }, 0) || 0;

      setStats({
        founders: foundersCount,
        investors: investorsCount,
        capital: totalCapital,
        deals: deals?.length || 0
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] overflow-x-hidden">
      <HeroSection stats={stats} />
      <TrustMarquee />
      <FeaturesSection />
      <StatsSection stats={stats} />
      <HowItWorksSection />
      <TestimonialsSection />
      <WaitlistSection />
      <Footer />
    </div>
  );
}

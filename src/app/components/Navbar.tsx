import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Menu, X, ChevronRight } from "lucide-react";

/* ─── Magnetic Button Component ─── */
function MagneticButton({ children, className = "", style = {}, ...props }: React.ComponentProps<typeof Link>) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div style={{ x: springX, y: springY }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <Link ref={ref} className={className} style={style} {...props}>
        {children}
      </Link>
    </motion.div>
  );
}

/* ─── Magnetic Nav Link ─── */
function MagneticNavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <a
        ref={ref}
        href={href}
        className="relative px-4 py-2 rounded-lg text-[#8A8A9A] hover:text-white transition-all"
        style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.01em" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {label}
        <motion.div
          className="absolute bottom-0 left-1/2 h-[2px] bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8] rounded-full"
          initial={{ width: 0, x: "-50%" }}
          animate={{ width: isHovered ? "60%" : "0%", x: "-50%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </a>
    </motion.div>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: { label: string; href: string }[] = [];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-white/[0.06]" : ""
      }`}
      style={{
        background: scrolled ? "rgba(0,0,0,0.88)" : "rgba(0,0,0,0.4)",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "blur(12px)",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="relative w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3C38BD] to-[#7E7AE8]" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#7E7AE8] to-[#3C38BD]"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative text-white" style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.02em" }}>S</span>
            </motion.div>
            <div className="flex items-center gap-1">
              <span className="text-white" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.03em" }}>Start</span>
              <span className="text-[#7E7AE8]" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.03em" }}>Hub</span>
            </div>
            <motion.span
              className="hidden sm:inline-flex px-2 py-0.5 rounded bg-[#3C38BD]/15 text-[#7E7AE8] ml-1"
              style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              BETA
            </motion.span>
          </Link>

          {/* Desktop Nav — Magnetic Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <MagneticNavLink key={link.label} href={link.href} label={link.label} />
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <MagneticButton
              to="/login"
              className="px-5 py-2.5 rounded-xl text-[#EBEDEF]/70 hover:text-white border border-white/[0.06] hover:border-[#7E7AE8]/30 hover:bg-[#16153C]/40 transition-all duration-300"
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              Sign in
            </MagneticButton>
            <MagneticButton
              to="/signup/founder"
              className="group flex items-center gap-2 px-2 py-2 text-[#EBEDEF]/80 hover:text-white transition-all duration-300"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <span className="relative pb-0.5">
                Get Started
                <span className="absolute left-0 bottom-0 w-full h-[1.5px] bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </span>
              <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="lg:hidden w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center text-white hover:bg-white/[0.08] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.9, rotate: 90 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden border-t border-white/[0.04]"
            style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(24px)" }}
          >
            <div className="px-4 py-6 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 rounded-lg text-[#8A8A9A] hover:text-white hover:bg-white/[0.04] transition-all"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="h-px bg-white/[0.06] my-3" />
              <Link to="/login" className="px-4 py-3 rounded-lg text-[#8A8A9A] hover:text-white transition-colors" style={{ fontSize: "14px", fontWeight: 500 }} onClick={() => setMenuOpen(false)}>
                Sign in
              </Link>
              <Link
                to="/signup/founder"
                className="mt-2 px-5 py-3 rounded-lg bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8] text-white text-center"
                style={{ fontSize: "14px", fontWeight: 600 }}
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

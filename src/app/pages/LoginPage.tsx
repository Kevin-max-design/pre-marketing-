import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowRight, Shield, Lock, Fingerprint, Loader2 } from "lucide-react";
import { GridBackground } from "../components/GridBackground";
import { login } from "../api";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      localStorage.setItem("user", JSON.stringify(result.user));
      if (result.user.role === "FOUNDER") {
        navigate("/founder");
      } else {
        navigate("/investor");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { fontSize: "14px", background: "rgba(22,21,60,0.6)", border: "1px solid rgba(126,122,232,0.1)", backdropFilter: "blur(8px)" };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 relative overflow-hidden">
      <GridBackground parallax={false} />

      {/* Floating orbs */}
      <motion.div className="absolute w-[500px] h-[500px] top-[10%] left-[20%] rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(60,56,189,0.1)" }} animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute w-[400px] h-[400px] bottom-[10%] right-[15%] rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(126,122,232,0.08)" }} animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.1, 0.04] }} transition={{ duration: 10, repeat: Infinity }} />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Security indicators */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-5 mb-8">
          {[{ icon: Lock, label: "Encrypted" }, { icon: Shield, label: "Secure" }, { icon: Fingerprint, label: "2FA Ready" }].map((item) => (
            <motion.div key={item.label} className="flex items-center gap-1.5" whileHover={{ scale: 1.05 }}>
              <item.icon size={12} className="text-[#7E7AE8]/40" />
              <span className="text-[#444]" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em" }}>{item.label.toUpperCase()}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="relative rounded-2xl p-[1px]">
            <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(180deg, rgba(60,56,189,0.2), transparent 40%, rgba(126,122,232,0.08))" }} />
            <div className="relative rounded-2xl p-8 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(22,21,60,0.9), rgba(0,0,0,0.95))", backdropFilter: "blur(24px)", boxShadow: "0 0 80px rgba(60,56,189,0.06)" }}>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <Link to="/" className="inline-block mb-6">
                    <motion.div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C38BD] to-[#7E7AE8] flex items-center justify-center mx-auto shadow-lg" style={{ boxShadow: "0 0 30px rgba(60,56,189,0.2)" }} whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      <span className="text-white" style={{ fontSize: "20px", fontWeight: 800 }}>S</span>
                    </motion.div>
                  </Link>
                  <motion.h1 className="text-white mb-1.5" style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Welcome back</motion.h1>
                  <motion.p className="text-[#8A8A9A]" style={{ fontSize: "14px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>Sign in to your StartHub account</motion.p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl text-red-400 text-center" style={{ fontSize: "13px", background: "rgba(212,24,61,0.1)", border: "1px solid rgba(212,24,61,0.2)" }}>
                    {error}
                  </motion.div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                    <label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>EMAIL</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full px-4 py-3.5 rounded-xl text-white placeholder-[#333] focus:outline-none focus:ring-1 focus:ring-[#7E7AE8]/30 transition-all" style={inputStyle} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>PASSWORD</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-3.5 rounded-xl text-white placeholder-[#333] focus:outline-none focus:ring-1 focus:ring-[#7E7AE8]/30 transition-all pr-12" style={inputStyle} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </motion.div>

                  <motion.button type="submit" disabled={loading} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="group relative w-full py-3.5 rounded-xl overflow-hidden mt-2 disabled:opacity-70" style={{ fontSize: "14px", fontWeight: 600 }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8] transition-all group-hover:shadow-[0_0_40px_rgba(60,56,189,0.4)]" />
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }} />
                    <span className="relative text-white flex items-center justify-center gap-2">
                      {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
                    </span>
                  </motion.button>
                </form>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 pt-6 border-t border-white/[0.04] text-center">
                  <p className="text-[#8A8A9A]" style={{ fontSize: "13px" }}>
                    Don't have an account?{" "}
                    <Link to="/signup/founder" className="text-[#7E7AE8] hover:underline" style={{ fontWeight: 600 }}>Create account</Link>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

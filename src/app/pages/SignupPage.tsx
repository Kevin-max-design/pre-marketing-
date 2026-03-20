import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowRight, Briefcase, TrendingUp, Shield, Loader2 } from "lucide-react";
import { GridBackground } from "../components/GridBackground";
import { signup } from "../api";

export function SignupPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const isFounder = role === "founder";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await signup({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        role: isFounder ? "FOUNDER" : "INVESTOR",
        city: city || undefined,
        industry: isFounder ? industry || undefined : undefined,
        investmentRange: !isFounder ? investmentRange || undefined : undefined,
      });
      localStorage.setItem("user", JSON.stringify(result.user));
      if (result.user.role === "FOUNDER") {
        navigate("/founder");
      } else {
        navigate("/investor");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3.5 rounded-xl text-white placeholder-[#333] focus:outline-none focus:ring-1 focus:ring-[#7E7AE8]/30 transition-all";
  const inputStyle: React.CSSProperties = { fontSize: "14px", background: "rgba(22,21,60,0.6)", border: "1px solid rgba(126,122,232,0.1)", backdropFilter: "blur(8px)" };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
      <GridBackground parallax={false} />
      <motion.div className="absolute w-[500px] h-[500px] top-[5%] left-[10%] rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(60,56,189,0.1)" }} animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.1, 0.04] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute w-[400px] h-[400px] bottom-[5%] right-[10%] rounded-full blur-[120px] pointer-events-none" style={{ background: "rgba(126,122,232,0.08)" }} animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.08, 0.03] }} transition={{ duration: 10, repeat: Infinity }} />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 w-full max-w-[440px]">
        <div className="relative rounded-2xl p-[1px]">
          <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(180deg, rgba(60,56,189,0.2), transparent 40%, rgba(126,122,232,0.08))" }} />
          <div className="relative rounded-2xl p-8 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(22,21,60,0.9), rgba(0,0,0,0.95))", backdropFilter: "blur(24px)", boxShadow: "0 0 80px rgba(60,56,189,0.06)" }}>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <Link to="/" className="inline-block mb-6">
                  <motion.div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3C38BD] to-[#7E7AE8] flex items-center justify-center mx-auto" style={{ boxShadow: "0 0 30px rgba(60,56,189,0.2)" }} whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                    <span className="text-white" style={{ fontSize: "20px", fontWeight: 800 }}>S</span>
                  </motion.div>
                </Link>

                {/* Role toggle */}
                <div className="inline-flex rounded-xl border border-white/[0.06] p-1 mb-6" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
                  {(["founder", "investor"] as const).map((tab) => (
                    <Link key={tab} to={`/signup/${tab}`} className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 relative ${(tab === "founder" ? isFounder : !isFounder) ? "text-white" : "text-[#8A8A9A] hover:text-white"}`} style={{ fontSize: "13px", fontWeight: 600 }}>
                      {(tab === "founder" ? isFounder : !isFounder) && <motion.div layoutId="signup-tab-bg" className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8]" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
                      <span className="relative flex items-center gap-2">{tab === "founder" ? <Briefcase size={14} /> : <TrendingUp size={14} />}{tab === "founder" ? "Founder" : "Investor"}</span>
                    </Link>
                  ))}
                </div>

                <motion.h1 key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-white mb-1.5" style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.03em" }}>{isFounder ? "Launch Your Startup" : "Start Investing"}</motion.h1>
                <motion.p key={`d-${role}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-[#8A8A9A]" style={{ fontSize: "14px" }}>{isFounder ? "Create an encrypted startup profile" : "Join as a verified investor"}</motion.p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-xl text-red-400 text-center" style={{ fontSize: "13px", background: "rgba(212,24,61,0.1)", border: "1px solid rgba(212,24,61,0.2)" }}>
                  {error}
                </motion.div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <div><label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>FIRST NAME</label><input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} style={inputStyle} /></div>
                  <div><label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>LAST NAME</label><input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputCls} style={inputStyle} /></div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>EMAIL</label>
                  <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} style={inputStyle} />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                  <label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>CITY</label>
                  <input type="text" placeholder="San Francisco" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} style={inputStyle} />
                </motion.div>
                <motion.div key={`f-${role}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  {!isFounder ? (
                    <div><label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>INVESTMENT RANGE</label><select className={`${inputCls} appearance-none`} style={inputStyle} value={investmentRange} onChange={(e) => setInvestmentRange(e.target.value)}><option value="" disabled>Select range</option><option>$500 - $5,000</option><option>$5,000 - $25,000</option><option>$25,000 - $100,000</option><option>$100,000+</option></select></div>
                  ) : (
                    <div><label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>INDUSTRY</label><select className={`${inputCls} appearance-none`} style={inputStyle} value={industry} onChange={(e) => setIndustry(e.target.value)}><option value="" disabled>Select industry</option><option>FinTech</option><option>HealthTech</option><option>EdTech</option><option>SaaS</option><option>AI/ML</option><option>E-Commerce</option><option>Other</option></select></div>
                  )}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                  <label className="block text-[#8A8A9A] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>PASSWORD</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className={`${inputCls} pr-12`} style={inputStyle} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-start gap-2.5 pt-1">
                  <Shield size={14} className="text-[#7E7AE8]/30 mt-0.5 shrink-0" />
                  <p className="text-[#444]" style={{ fontSize: "12px", lineHeight: 1.5 }}>By creating an account, you agree to our Terms & Privacy Policy. Data is encrypted end-to-end.</p>
                </motion.div>
                <motion.button type="submit" disabled={loading} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="group relative w-full py-3.5 rounded-xl overflow-hidden disabled:opacity-70" style={{ fontSize: "14px", fontWeight: 600 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8] transition-all group-hover:shadow-[0_0_40px_rgba(60,56,189,0.4)]" />
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }} />
                  <span className="relative text-white flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
                  </span>
                </motion.button>
              </form>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-6 pt-6 border-t border-white/[0.04] text-center">
                <p className="text-[#8A8A9A]" style={{ fontSize: "13px" }}>Already have an account?{" "}<Link to="/login" className="text-[#7E7AE8] hover:underline" style={{ fontWeight: 600 }}>Sign in</Link></p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

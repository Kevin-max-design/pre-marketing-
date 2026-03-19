import { useState } from "react";
import { motion } from "motion/react";
import {
  LayoutGrid, Bookmark, Send, Handshake, MessageSquare, User,
  Bell, Menu, MapPin, Building2, DollarSign,
  Heart, Clock, Search, Cpu
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { DashboardSidebar } from "../components/DashboardSidebar";

const sidebarItems = [
  { icon: LayoutGrid, label: "Startup Feed", id: "feed" },
  { icon: Bookmark, label: "Saved Startups", id: "saved" },
  { icon: Send, label: "Requests Sent", id: "requests" },
  { icon: Handshake, label: "Matches", id: "matches" },
  { icon: MessageSquare, label: "Messages", id: "messages", badge: 1 },
  { icon: User, label: "Profile", id: "profile" },
];

const mockStartups = [
  { id: "STR-4821", industry: "FinTech", stage: "Pre-Seed", location: "San Francisco, CA", fundingNeeded: "$150K", pitch: "Building next-gen payment infrastructure for emerging markets with 10x lower transaction fees.", matchScore: 92, saved: false, tags: ["Payments", "B2B"] },
  { id: "STR-7293", industry: "HealthTech", stage: "Seed", location: "New York, NY", fundingNeeded: "$300K", pitch: "AI-powered diagnostic platform for early disease detection, already deployed in 5 hospitals.", matchScore: 87, saved: true, tags: ["AI", "Healthcare"] },
  { id: "STR-1056", industry: "EdTech", stage: "Pre-Seed", location: "Austin, TX", fundingNeeded: "$80K", pitch: "Gamified learning platform for K-12 STEM education with adaptive curriculum engine.", matchScore: 78, saved: false, tags: ["Education", "K-12"] },
  { id: "STR-5438", industry: "AI/ML", stage: "Seed", location: "Seattle, WA", fundingNeeded: "$500K", pitch: "Enterprise automation platform reducing operational costs by 40% using proprietary AI models.", matchScore: 95, saved: false, tags: ["Enterprise", "Automation"] },
  { id: "STR-8912", industry: "SaaS", stage: "Pre-Seed", location: "Miami, FL", fundingNeeded: "$120K", pitch: "All-in-one workspace tool for remote teams combining project management and real-time collaboration.", matchScore: 84, saved: true, tags: ["Remote", "Productivity"] },
  { id: "STR-3367", industry: "E-Commerce", stage: "Seed", location: "Chicago, IL", fundingNeeded: "$200K", pitch: "AI-curated sustainable fashion marketplace connecting eco-conscious brands with consumers.", matchScore: 71, saved: false, tags: ["Sustainability", "Fashion"] },
];

const mockRequestsSent = [
  { id: "STR-4821", industry: "FinTech", status: "pending", sentAt: "2 hours ago" },
  { id: "STR-1056", industry: "EdTech", status: "pending", sentAt: "1 day ago" },
  { id: "STR-7293", industry: "HealthTech", status: "approved", sentAt: "3 days ago" },
];

const mockMatches = [
  { id: "STR-7293", founderName: "Jane Smith", industry: "HealthTech", matchedAt: "3 days ago" },
];

function MatchScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#6C8EFF" : score >= 75 ? "#38BDF8" : score >= 60 ? "#93B4FF" : "#8A8A9A";

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(108,142,255,0.06)" strokeWidth="2" />
        <motion.circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, delay: 0.2 }} />
      </svg>
      <span className="absolute" style={{ fontSize: "11px", fontWeight: 700, color }}>{score}</span>
    </div>
  );
}

function StartupCard({ startup, onSave, onRequest }: { startup: typeof mockStartups[0]; onSave: (id: string) => void; onRequest: (id: string) => void }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[#444]" style={{ fontSize: "11px", fontFamily: "monospace" }}>{startup.id}</span>
            <span className="px-2 py-0.5 rounded text-[#6C8EFF]" style={{ fontSize: "10px", fontWeight: 600, background: "rgba(108,142,255,0.1)" }}>{startup.stage}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8A8A9A]" style={{ fontSize: "13px", fontWeight: 500 }}><Building2 size={13} /> {startup.industry}</div>
        </div>
        <MatchScoreRing score={startup.matchScore} />
      </div>
      <p className="text-[#D2D2D2] mb-4" style={{ fontSize: "13.5px", lineHeight: 1.65 }}>{startup.pitch}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {startup.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 rounded text-[#8A8A9A]" style={{ fontSize: "11px", fontWeight: 500, background: "rgba(255,255,255,0.03)" }}>{tag}</span>))}
      </div>
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-1 text-[#555]" style={{ fontSize: "12px" }}><MapPin size={12} /> {startup.location}</div>
        <div className="flex items-center gap-1 text-[#6C8EFF]/70" style={{ fontSize: "12px", fontWeight: 600 }}><DollarSign size={12} /> {startup.fundingNeeded}</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onRequest(startup.id)} className="group relative flex-1 py-2.5 rounded-xl overflow-hidden" style={{ fontSize: "12px", fontWeight: 600 }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] group-hover:shadow-[0_0_20px_rgba(108,142,255,0.3)] transition-all" />
          <span className="relative text-white flex items-center justify-center gap-1.5"><Send size={13} /> Request Access</span>
        </button>
        <button onClick={() => onSave(startup.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${startup.saved ? "text-[#6C8EFF]" : "text-[#555] hover:text-white hover:bg-white/[0.04]"}`} style={startup.saved ? { background: "rgba(108,142,255,0.1)", border: "1px solid rgba(108,142,255,0.15)" } : { border: "1px solid rgba(255,255,255,0.06)" }}>
          <Heart size={15} fill={startup.saved ? "#6C8EFF" : "none"} />
        </button>
      </div>
    </GlassCard>
  );
}

export function InvestorDashboard() {
  const [activeTab, setActiveTab] = useState("feed");
  const [startups, setStartups] = useState(mockStartups);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSave = (id: string) => setStartups((p) => p.map((s) => (s.id === id ? { ...s, saved: !s.saved } : s)));
  const savedStartups = startups.filter((s) => s.saved);
  const filteredStartups = searchQuery ? startups.filter((s) => s.industry.toLowerCase().includes(searchQuery.toLowerCase()) || s.pitch.toLowerCase().includes(searchQuery.toLowerCase())) : startups;

  const inputStyle: React.CSSProperties = { fontSize: "14px", background: "rgba(10,14,26,0.8)", border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" };

  return (
    <div className="min-h-screen bg-[#080B16] pt-[72px] flex">
      <DashboardSidebar items={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userName="Sarah Chen" userInitials="SC" userRole="Investor" />

      <main className="flex-1 min-w-0">
        <div className="sticky top-[72px] z-20 border-b border-white/[0.04] px-5 lg:px-8 py-4 flex items-center justify-between gap-4" style={{ background: "rgba(8,11,22,0.92)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-white shrink-0" onClick={() => setSidebarOpen(true)}><Menu size={16} /></button>
            <div className="min-w-0">
              <h1 className="text-white truncate" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>{sidebarItems.find((i) => i.id === activeTab)?.label}</h1>
              <p className="text-[#555] hidden sm:block" style={{ fontSize: "12px" }}>Discover and invest in private startups</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === "feed" && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl w-[200px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <Search size={14} className="text-[#444]" />
                <input type="text" placeholder="Search startups..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-white placeholder-[#444] focus:outline-none w-full" style={{ fontSize: "13px" }} />
              </div>
            )}
            <button className="relative w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#8A8A9A] hover:text-white hover:bg-white/[0.08] transition-all">
              <Bell size={16} /><span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#6C8EFF]" />
            </button>
          </div>
        </div>

        <div className="p-5 lg:p-8">
          {activeTab === "feed" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(108,142,255,0.04)", border: "1px solid rgba(108,142,255,0.08)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(108,142,255,0.1)" }}><Cpu size={16} className="text-[#6C8EFF]" /></div>
                <div>
                  <p className="text-white" style={{ fontSize: "13px", fontWeight: 600 }}>AI-curated feed based on your investment thesis</p>
                  <p className="text-[#555]" style={{ fontSize: "12px" }}>Showing {filteredStartups.length} startups ranked by match score</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredStartups.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <StartupCard startup={s} onSave={toggleSave} onRequest={() => {}} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "saved" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {savedStartups.length === 0 ? (
                <div className="text-center py-20"><div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4"><Bookmark size={24} className="text-[#333]" /></div><p className="text-[#8A8A9A]" style={{ fontSize: "15px", fontWeight: 600 }}>No saved startups</p><p className="text-[#444] mt-1" style={{ fontSize: "13px" }}>Save startups from the feed to review later</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{savedStartups.map((s) => <StartupCard key={s.id} startup={s} onSave={toggleSave} onRequest={() => {}} />)}</div>
              )}
            </motion.div>
          )}

          {activeTab === "requests" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {mockRequestsSent.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard hover={false}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}><Building2 size={16} className="text-[#8A8A9A]" /></div>
                        <div><p className="text-white" style={{ fontSize: "14px", fontWeight: 600, fontFamily: "monospace" }}>{req.id}</p><p className="text-[#555]" style={{ fontSize: "13px" }}>{req.industry}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${req.status === "approved" ? "text-[#22c55e]" : "text-yellow-400"}`} style={{ fontSize: "11px", fontWeight: 600, background: req.status === "approved" ? "rgba(34,197,94,0.1)" : "rgba(250,204,21,0.1)" }}>
                          <div className={`w-1.5 h-1.5 rounded-full ${req.status === "approved" ? "bg-[#22c55e]" : "bg-yellow-400"}`} />{req.status === "approved" ? "Approved" : "Pending"}
                        </span>
                        <span className="text-[#444] flex items-center gap-1" style={{ fontSize: "11px" }}><Clock size={11} /> {req.sentAt}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "matches" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {mockMatches.map((m) => (
                <GlassCard key={m.id} hover={false}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(108,142,255,0.15), rgba(56,189,248,0.08))", border: "1px solid rgba(108,142,255,0.12)" }}><Handshake size={20} className="text-[#6C8EFF]" /></div>
                      <div><p className="text-white" style={{ fontSize: "15px", fontWeight: 600 }}>{m.founderName}</p><p className="text-[#555]" style={{ fontSize: "13px" }}>{m.industry} · {m.matchedAt}</p></div>
                    </div>
                    <button className="group relative px-5 py-2.5 rounded-xl overflow-hidden" style={{ fontSize: "12px", fontWeight: 600 }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] group-hover:shadow-[0_0_20px_rgba(108,142,255,0.3)] transition-all" />
                      <span className="relative text-white flex items-center gap-1.5"><MessageSquare size={13} /> Start Chat</span>
                    </button>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center py-20"><div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4"><MessageSquare size={24} className="text-[#333]" /></div><p className="text-[#8A8A9A]" style={{ fontSize: "15px", fontWeight: 600 }}>No messages yet</p><p className="text-[#444] mt-1" style={{ fontSize: "13px" }}>Get matched with a startup to start chatting</p></div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard hover={false}>
                <h3 className="text-white mb-1" style={{ fontSize: "17px", fontWeight: 700 }}>Investor Profile</h3>
                <p className="text-[#555] mb-6" style={{ fontSize: "13px" }}>Your profile is visible to founders when you request access</p>
                <div className="space-y-5 max-w-lg">
                  {[{ l: "NAME", v: "Sarah Chen" }, { l: "EMAIL", v: "sarah@invest.com" }, { l: "CITY", v: "San Francisco" }, { l: "INVESTMENT RANGE", v: "$25,000 – $100,000" }].map((f) => (
                    <div key={f.l}><label className="block text-[#555] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>{f.l}</label><input type="text" defaultValue={f.v} className="w-full px-4 py-3.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#6C8EFF]/30 transition-all" style={inputStyle} /></div>
                  ))}
                  <div><label className="block text-[#555] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>BIO</label><textarea defaultValue="Angel investor focused on SaaS and AI startups. 10+ portfolio companies." rows={3} className="w-full px-4 py-3.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#6C8EFF]/30 transition-all resize-none" style={inputStyle} /></div>
                  <button className="group relative px-6 py-3 rounded-xl overflow-hidden" style={{ fontSize: "13px", fontWeight: 600 }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] group-hover:shadow-[0_0_20px_rgba(108,142,255,0.3)] transition-all" />
                    <span className="relative text-white">Save Changes</span>
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

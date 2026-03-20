import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { motion } from "motion/react";
import {
  Rocket, Users, MessageSquare, Settings, CheckCircle, XCircle,
  TrendingUp, DollarSign, Eye, Bell, Menu, ArrowUpRight,
  ArrowDownRight, Shield
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const sidebarItems = [
  { icon: Rocket, label: "My Startup", id: "startup" },
  { icon: Users, label: "Investor Requests", id: "requests", badge: 0 },
  { icon: CheckCircle, label: "Approved Investors", id: "approved" },
  { icon: MessageSquare, label: "Messages", id: "messages" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const viewsData = [
  { day: "Mon", views: 12 }, { day: "Tue", views: 19 }, { day: "Wed", views: 28 },
  { day: "Thu", views: 24 }, { day: "Fri", views: 35 }, { day: "Sat", views: 31 }, { day: "Sun", views: 42 },
];
const requestsChartData = [
  { day: "Mon", count: 1 }, { day: "Tue", count: 2 }, { day: "Wed", count: 3 },
  { day: "Thu", count: 1 }, { day: "Fri", count: 4 }, { day: "Sat", count: 2 }, { day: "Sun", count: 5 },
];

function MiniChart({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#g-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FounderDashboard() {
  const [activeTab, setActiveTab] = useState("startup");
  const [requests, setRequests] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [stats, setStats] = useState({ views: 0, requests: 0, funding: 0, match: 0 });

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Startup & Access Requests
      const { data: startup } = await supabase.from('startups').select('*').eq('founder_id', user.id).single();
      if (startup) {
        // Fetch Pending Requests
        const { data: reqs } = await supabase.from('access_requests')
          .select('*, investor:investor(*)')
          .eq('startup_id', startup.id)
          .eq('status', 'pending');
          
        if (reqs) {
          setRequests(reqs.map((r: any) => ({
             id: r.id, 
             name: r.investor?.first_name ? `${r.investor.first_name} ${r.investor.last_name}` : (r.investor?.email || "Waitlist Entry"),
             range: "Direct Interest", 
             bio: "Investor profile linked via encrypted vault.", 
             matchScore: 95
          })));
        }

        // Fetch Approved Investors
        const { data: appr } = await supabase.from('access_requests')
          .select('*, investor:investor(*)')
          .eq('startup_id', startup.id)
          .eq('status', 'approved');
        
        if (appr) {
          setApproved(appr.map((r: any) => ({
            id: r.id,
            name: r.investor?.first_name ? `${r.investor.first_name} ${r.investor.last_name}` : (r.investor?.email || "Waitlist Entry"),
            range: "Verified Contact",
            bio: "Investor matches your startup profile requirements.",
            approvedAt: new Date(r.updated_at).toLocaleDateString()
          })));
        }

        // Update Stats
        setStats(s => ({
          ...s,
          requests: reqs ? reqs.length : 0,
          funding: parseFloat(startup.funding_needed.replace(/[^0-9.]/g, '')) || 0
        }));
      }
    }
    if (user.id) fetchData();
  }, [user.id]);

  const handleApprove = async (id: number | string) => {
    if (typeof id === 'string') await supabase.from('access_requests').update({ status: 'approved' }).eq('id', id);
    setRequests((p) => p.filter((r) => r.id !== id));
  };
  const handleReject = async (id: number | string) => {
    if (typeof id === 'string') await supabase.from('access_requests').update({ status: 'rejected' }).eq('id', id);
    setRequests((p) => p.filter((r) => r.id !== id));
  };

  const inputStyle: React.CSSProperties = { fontSize: "14px", background: "rgba(10,14,26,0.8)", border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" };

  return (
    <div className="min-h-screen bg-[#080B16] pt-[72px] flex">
      <DashboardSidebar items={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userName="John Doe" userInitials="JD" userRole="Founder" />

      <main className="flex-1 min-w-0">
        <div className="sticky top-[72px] z-20 border-b border-white/[0.04] px-5 lg:px-8 py-4 flex items-center justify-between" style={{ background: "rgba(8,11,22,0.92)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-white" onClick={() => setSidebarOpen(true)}><Menu size={16} /></button>
            <div>
              <h1 className="text-white" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.02em" }}>{sidebarItems.find((i) => i.id === activeTab)?.label}</h1>
              <p className="text-[#555] hidden sm:block" style={{ fontSize: "12px" }}>Manage your startup and investor relations</p>
            </div>
          </div>
          <button className="relative w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#8A8A9A] hover:text-white hover:bg-white/[0.08] transition-all">
            <Bell size={16} /><span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#6C8EFF]" />
          </button>
        </div>

        <div className="p-5 lg:p-8">
          {activeTab === "startup" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: Eye, label: "Profile Views", value: stats.views.toString(), change: "0%", up: true, chart: viewsData, dataKey: "views" },
                  { icon: Users, label: "Access Requests", value: stats.requests.toString(), change: `${stats.requests} new`, up: true, chart: requestsChartData, dataKey: "count" },
                  { icon: DollarSign, label: "Funding Goal", value: `$${(stats.funding/1000).toFixed(1)}K`, change: `0% of $${(stats.funding/1000).toFixed(1)}K`, up: true, chart: null, dataKey: "" },
                  { icon: TrendingUp, label: "Match Score", value: "0", change: "New startup", up: true, chart: null, dataKey: "" },
                ].map((stat) => (
                  <GlassCard key={stat.label} hover={false}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(108,142,255,0.08)", border: "1px solid rgba(108,142,255,0.1)" }}>
                        <stat.icon size={16} className="text-[#6C8EFF]" />
                      </div>
                      <div className={`flex items-center gap-0.5 ${stat.up ? "text-[#22c55e]" : "text-red-400"}`}>
                        {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        <span style={{ fontSize: "11px", fontWeight: 600 }}>{stat.change}</span>
                      </div>
                    </div>
                    <p className="text-white mb-0.5" style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em" }}>{stat.value}</p>
                    <p className="text-[#555]" style={{ fontSize: "12px", fontWeight: 500 }}>{stat.label}</p>
                    {stat.chart && <div className="mt-3 -mx-1"><MiniChart data={stat.chart} dataKey={stat.dataKey} color="#6C8EFF" /></div>}
                  </GlassCard>
                ))}
              </div>

              <GlassCard hover={false}>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-white mb-1" style={{ fontSize: "17px", fontWeight: 700 }}>Startup Profile</h3>
                    <p className="text-[#555]" style={{ fontSize: "13px" }}>Encrypted and private by default</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#6C8EFF]" style={{ fontSize: "11px", fontWeight: 600, background: "rgba(108,142,255,0.08)", border: "1px solid rgba(108,142,255,0.1)" }}>
                      <Shield size={11} /> PRIVATE
                    </span>
                    <button className="px-3 py-1.5 rounded-lg border border-white/[0.06] text-[#8A8A9A] hover:bg-white/[0.04] transition-all" style={{ fontSize: "12px", fontWeight: 500 }}>Edit Profile</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                  {[{ l: "INDUSTRY", v: "FinTech / SaaS" }, { l: "STAGE", v: "Pre-Seed" }, { l: "LOCATION", v: "San Francisco, CA" }, { l: "FUNDING", v: "$150,000" }].map((f) => (
                    <div key={f.l}><p className="text-[#555] mb-1" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>{f.l}</p><p className="text-white" style={{ fontSize: "15px", fontWeight: 600 }}>{f.v}</p></div>
                  ))}
                </div>
                <div className="pt-5 border-t border-white/[0.04]">
                  <p className="text-[#555] mb-1.5" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>PITCH</p>
                  <p className="text-[#D2D2D2]" style={{ fontSize: "14px", lineHeight: 1.7 }}>Building the next-generation payment infrastructure for emerging markets. Our platform enables seamless cross-border transactions with 10x lower fees and 3x faster settlement times.</p>
                </div>
                <div className="mt-6 pt-5 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#555]" style={{ fontSize: "12px", fontWeight: 600 }}>Funding Progress</p>
                    <p className="text-[#6C8EFF]" style={{ fontSize: "12px", fontWeight: 600 }}>$67.5K / $150K</p>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(108,142,255,0.08)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8]" />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "requests" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-[#555] mb-2" style={{ fontSize: "13px" }}>{requests.length} pending requests</p>
              {requests.length === 0 ? (
                <div className="text-center py-20"><div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4"><Users size={24} className="text-[#333]" /></div><p className="text-[#8A8A9A]" style={{ fontSize: "15px", fontWeight: 600 }}>All caught up</p></div>
              ) : requests.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard hover={false}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(108,142,255,0.15), rgba(56,189,248,0.08))", border: "1px solid rgba(108,142,255,0.12)" }}>
                          <span className="text-[#6C8EFF]" style={{ fontSize: "13px", fontWeight: 700 }}>{req.name.split(" ").map((n: string) => n[0]).join("")}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white" style={{ fontSize: "14px", fontWeight: 600 }}>{req.name}</p>
                            <span className="px-2 py-0.5 rounded text-[#6C8EFF]" style={{ fontSize: "10px", fontWeight: 600, background: "rgba(108,142,255,0.1)" }}>{req.matchScore}% MATCH</span>
                          </div>
                          <p className="text-[#6C8EFF]/70" style={{ fontSize: "12px", fontWeight: 600 }}>{req.range}</p>
                          <p className="text-[#8A8A9A] mt-1" style={{ fontSize: "13px", lineHeight: 1.5 }}>{req.bio}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleApprove(req.id)} className="group relative px-4 py-2.5 rounded-xl overflow-hidden" style={{ fontSize: "12px", fontWeight: 600 }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] group-hover:shadow-[0_0_20px_rgba(108,142,255,0.3)] transition-all" />
                          <span className="relative text-white flex items-center gap-1.5"><CheckCircle size={14} /> Approve</span>
                        </button>
                        <button onClick={() => handleReject(req.id)} className="px-4 py-2.5 rounded-xl border border-white/[0.06] text-[#8A8A9A] hover:text-white hover:bg-white/[0.04] transition-all flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                          <XCircle size={14} /> Decline
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "approved" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {approved.length === 0 ? (
                <div className="text-center py-20"><div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4"><CheckCircle size={24} className="text-[#333]" /></div><p className="text-[#8A8A9A]" style={{ fontSize: "15px", fontWeight: 600 }}>No approved investors</p></div>
              ) : approved.map((inv, i) => (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard hover={false}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, rgba(108,142,255,0.15), rgba(56,189,248,0.08))", border: "1px solid rgba(108,142,255,0.12)" }}>
                          <span className="text-[#6C8EFF]" style={{ fontSize: "13px", fontWeight: 700 }}>{inv.name.split(" ").map((n: string) => n[0]).join("")}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2"><p className="text-white" style={{ fontSize: "14px", fontWeight: 600 }}>{inv.name}</p><CheckCircle size={13} className="text-[#22c55e]" /></div>
                          <p className="text-[#6C8EFF]/70" style={{ fontSize: "12px", fontWeight: 600 }}>{inv.range}</p>
                          <p className="text-[#8A8A9A] mt-1" style={{ fontSize: "13px" }}>{inv.bio}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[#444]" style={{ fontSize: "11px" }}>{inv.approvedAt}</span>
                        <button className="px-4 py-2.5 rounded-xl border border-white/[0.06] text-[#8A8A9A] hover:text-white hover:bg-white/[0.04] transition-all flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500 }}><MessageSquare size={13} /> Message</button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center py-20"><div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4"><MessageSquare size={24} className="text-[#333]" /></div><p className="text-[#8A8A9A]" style={{ fontSize: "15px", fontWeight: 600 }}>No messages yet</p><p className="text-[#444] mt-1" style={{ fontSize: "13px" }}>Approve investors to start a conversation</p></div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassCard hover={false}>
                <h3 className="text-white mb-1" style={{ fontSize: "17px", fontWeight: 700 }}>Account Settings</h3>
                <p className="text-[#555] mb-6" style={{ fontSize: "13px" }}>Manage your account details</p>
                <div className="space-y-5 max-w-lg">
                  {[{ l: "DISPLAY NAME", v: "John Doe" }, { l: "EMAIL", v: "john@startup.com" }, { l: "CITY", v: "San Francisco" }].map((f) => (
                    <div key={f.l}><label className="block text-[#555] mb-2" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>{f.l}</label><input type="text" defaultValue={f.v} className="w-full px-4 py-3.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#6C8EFF]/30 transition-all" style={inputStyle} /></div>
                  ))}
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

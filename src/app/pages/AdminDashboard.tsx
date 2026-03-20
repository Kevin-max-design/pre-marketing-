import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, UserPlus, Trash2, Edit3, Search, Filter, 
  Shield, TrendingUp, Briefcase, Mail, Calendar, 
  ChevronRight, Loader2, AlertCircle, RefreshCw, Lock as LockIcon
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { fetchAllProfiles, deleteProfile, maskEmail, fetchGlobalStats } from "../api";

export function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, founders: 0, investors: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProfiles, globalStats] = await Promise.all([
        fetchAllProfiles(),
        fetchGlobalStats()
      ]);
      const filteredProfiles = allProfiles.filter((p: any) => p.role !== 'ADMIN');
      setUsers(filteredProfiles);
      setStats({
        ...globalStats,
        total: globalStats.founders + globalStats.investors
      });
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, email: string) => {
    if (window.confirm(`Are you sure you want to delete profile for ${email}?`)) {
      try {
        await deleteProfile(id);
        setUsers((u: any[]) => u.filter((user: any) => user.id !== id));
        loadData(); // Refresh stats
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const filteredProfiles = users.filter(p => {
    const matchesSearch = p.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRole === "ALL" || p.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const inputStyle: React.CSSProperties = { 
    fontSize: "14px", 
    background: "rgba(255,255,255,0.03)", 
    border: "1px solid rgba(255,255,255,0.05)", 
    backdropFilter: "blur(12px)" 
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3C38BD]/10 via-transparent to-[#7E7AE8]/5 blur-3xl pointer-events-none" />
        <GlassCard className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3C38BD] to-[#7E7AE8] flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-white text-2xl font-bold mb-2">Secure Admin Access</h1>
            <p className="text-[#8A8A9A] text-sm">Please enter your password to continue</p>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (password === "Ajitesh@7816016526") {
                setIsAuthenticated(true);
              } else {
                alert("Invalid password");
              }
            }}
            className="space-y-4"
          >
            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" size={18} />
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-[#333] focus:outline-none focus:ring-1 focus:ring-[#3C38BD]/50 transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8] text-white font-bold tracking-tight hover:shadow-[0_0_30px_rgba(60,56,189,0.3)] transition-all"
            >
              Unlock Dashboard
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-5 lg:px-12 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3C38BD]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7E7AE8]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C38BD] to-[#7E7AE8] flex items-center justify-center shadow-lg">
                <Shield size={20} className="text-white" />
              </div>
              <h1 className="text-white" style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.04em" }}>Admin Core</h1>
            </div>
            <p className="text-[#8A8A9A]" style={{ fontSize: "14px" }}>System-wide user management and analytics</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[#8A8A9A] hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#3C38BD] to-[#7E7AE8] text-white" style={{ fontSize: "14px", fontWeight: 600 }}>
              <UserPlus size={18} /> Add Member
            </button>
          </div>
        </div>

        {/* Real Data Stats (Numbers only for sensitivity) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.total, icon: Users, color: "#7E7AE8" },
            { label: "Founders", value: stats.founders, icon: Briefcase, color: "#3C38BD" },
            { label: "Investors", value: stats.investors, icon: TrendingUp, color: "#22c55e" }
          ].map((stat) => (
            <GlassCard key={stat.label} hover={false} className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full -mr-12 -mt-12 transition-all group-hover:bg-white/[0.04]" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                  <stat.icon size={14} style={{ color: stat.color }} />
                </div>
                <span className="text-[#555]" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em" }}>{stat.label.toUpperCase()}</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tighter">{stat.value}</div>
            </GlassCard>
          ))}
        </div>

        <GlassCard hover={false} className="p-0 overflow-hidden">
          {/* Table Controls */}
          <div className="p-6 border-b border-white/[0.04] flex flex-col md:flex-row gap-4 justify-between bg-white/[0.01]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-[#444] focus:outline-none transition-all"
                style={inputStyle}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {["ALL", "FOUNDER", "INVESTOR"].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-4 py-2.5 rounded-lg border transition-all whitespace-nowrap`}
                  style={{ 
                    fontSize: "12px", 
                    fontWeight: 600,
                    background: filterRole === role ? "rgba(126,122,232,0.15)" : "transparent",
                    borderColor: filterRole === role ? "rgba(126,122,232,0.3)" : "rgba(255,255,255,0.05)",
                    color: filterRole === role ? "#7E7AE8" : "#8A8A9A"
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* User List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4 text-[#444]">
                <Loader2 className="animate-spin" size={32} />
                <p style={{ fontSize: "14px", fontWeight: 500 }}>Decrypting Records...</p>
              </div>
            ) : error ? (
              <div className="py-20 flex flex-col items-center gap-4 text-red-500/60">
                <AlertCircle size={32} />
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{error}</p>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="py-20 text-center text-[#444]">
                <p style={{ fontSize: "14px", fontWeight: 500 }}>No profiles found matching criteria</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[#555]" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }}>
                    <th className="px-6 py-4">USER / EMAIL</th>
                    <th className="px-6 py-4">ROLE</th>
                    <th className="px-6 py-4">LOCATION</th>
                    <th className="px-6 py-4">JOINED</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredProfiles.map((user) => (
                    <motion.tr 
                      key={user.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="group/row hover:bg-white/[0.01] transition-all"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[#8A8A9A] group-hover/row:text-white transition-all">
                            {user.first_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold" style={{ fontSize: "14px" }}>{user.first_name} {user.last_name}</p>
                            <p className="text-[#444] font-medium" style={{ fontSize: "12px" }}>{maskEmail(user.email)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                          user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' :
                          user.role === 'INVESTOR' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[#8A8A9A]" style={{ fontSize: "13px" }}>{user.city || "-"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[#555]" style={{ fontSize: "12px" }}>
                          <Calendar size={12} />
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all">
                          <button className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#8A8A9A] hover:text-white hover:bg-white/[0.08] transition-all">
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id, user.email)}
                            className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t border-white/[0.04] bg-white/[0.01] flex justify-between items-center text-[#444]" style={{ fontSize: "12px" }}>
            <p>Showing {filteredProfiles.length} active encrypted profiles</p>
            <div className="flex items-center gap-1">
              <Shield size={10} />
              <span>SOC2 Compliant Storage</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

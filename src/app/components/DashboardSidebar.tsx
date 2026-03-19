import { Link } from "react-router";
import { LogOut } from "lucide-react";
import { type ComponentType } from "react";

interface SidebarItem {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  id: string;
  badge?: number;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userName: string;
  userInitials: string;
  userRole: string;
}

export function DashboardSidebar({
  items, activeTab, setActiveTab, isOpen, setIsOpen, userName, userInitials, userRole,
}: DashboardSidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-[72px] left-0 z-40 w-[260px] h-[calc(100vh-72px)] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, rgba(10,14,26,0.98), rgba(8,11,22,0.98))",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* User profile */}
        <div className="p-5 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C8EFF]/25 to-[#38BDF8]/10 border border-[#6C8EFF]/15 flex items-center justify-center">
              <span className="text-[#6C8EFF]" style={{ fontSize: "13px", fontWeight: 700 }}>{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white truncate" style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em" }}>{userName}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <p className="text-[#555]" style={{ fontSize: "11px", fontWeight: 500 }}>{userRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                  isActive ? "text-[#6C8EFF]" : "text-[#8A8A9A] hover:text-white hover:bg-white/[0.03]"
                }`}
                style={{ fontSize: "13.5px", fontWeight: isActive ? 600 : 500 }}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl border border-[#6C8EFF]/15" style={{ background: "rgba(108,142,255,0.06)", backdropFilter: "blur(8px)" }} />
                )}
                <item.icon size={17} className="relative" />
                <span className="flex-1 text-left relative">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="relative px-2 py-0.5 rounded-md bg-gradient-to-r from-[#6C8EFF] to-[#38BDF8] text-white" style={{ fontSize: "10px", fontWeight: 700, minWidth: "20px", textAlign: "center" }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.04]">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#555] hover:text-white hover:bg-white/[0.03] transition-all"
            style={{ fontSize: "13.5px", fontWeight: 500 }}
          >
            <LogOut size={17} /> Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}

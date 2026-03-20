import { motion } from "motion/react";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#080B16] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C8EFF]/10 border border-[#6C8EFF]/20 text-[#6C8EFF] mb-6" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Shield size={14} /> LEGAL COMPLIANCE
          </div>
          <h1 className="text-white mb-4" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Privacy Policy
          </h1>
          <p className="text-[#8A8A9A]" style={{ fontSize: "16px" }}>Last updated: March 20, 2026</p>
        </motion.div>

        <GlassCard className="p-8 md:p-12 space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6C8EFF]/10 flex items-center justify-center text-[#6C8EFF]">
                <Eye size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>1. Data We Collect</h2>
            </div>
            <p className="text-[#8A8A9A] leading-relaxed">
              StartHub collects minimal data required to facilitate private connections between founders and investors. This includes:
            </p>
            <ul className="list-disc list-inside text-[#8A8A9A] space-y-2 ml-4">
              <li>Authentication data (Email, provided via Supabase Auth)</li>
              <li>Profile information (Name, Role, Industry, Investment Thesis)</li>
              <li>Startup metrics (Funding needed, Pitch deck references)</li>
              <li>Communication metadata (Encrypted message timestamps)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6C8EFF]/10 flex items-center justify-center text-[#6C8EFF]">
                <Lock size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>2. How We Protect Your Data</h2>
            </div>
            <p className="text-[#8A8A9A] leading-relaxed">
              Security is our core priority. We employ multi-layer protection:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-white mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>End-to-End Encryption</h4>
                <p className="text-[#555]" style={{ fontSize: "13px" }}>Sensitive pitch data is encrypted at rest and only accessible to verified approved parties.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-white mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>Masked Profiles</h4>
                <p className="text-[#555]" style={{ fontSize: "13px" }}>Founders remain anonymous until they explicitly approve an investor's access request.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6C8EFF]/10 flex items-center justify-center text-[#6C8EFF]">
                <FileText size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>3. Information Sharing</h2>
            </div>
            <p className="text-[#8A8A9A] leading-relaxed">
              We never sell your data. Information is only shared between a Founder and an Investor after mutual 
              consent via our "Request Access" protocol. We use Supabase for secure data hosting and Vercel 
              for application delivery.
            </p>
          </section>

          <section className="pt-8 border-t border-white/[0.05]">
            <p className="text-[#555] italic" style={{ fontSize: "13px" }}>
              For privacy-related inquiries, please contact our compliance team at privacy@starthub.network
            </p>
          </section>
        </GlassCard>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { Gavel, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#080B16] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C8EFF]/10 border border-[#6C8EFF]/20 text-[#6C8EFF] mb-6" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Gavel size={14} /> TERMS OF SERVICE
          </div>
          <h1 className="text-white mb-4" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Terms & Conditions
          </h1>
          <p className="text-[#8A8A9A]" style={{ fontSize: "16px" }}>Last updated: March 20, 2026</p>
        </motion.div>

        <GlassCard className="p-8 md:p-12 space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6C8EFF]/10 flex items-center justify-center text-[#6C8EFF]">
                <UserCheck size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>1. Eligibility</h2>
            </div>
            <p className="text-[#8A8A9A] leading-relaxed">
              By using StartHub, you represent that you are an Accredited Investor (if registering as an Investor) 
              or a legitimate startup founder. StartHub reserves the right to verify identities and professional 
              backgrounds to maintain platform integrity.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6C8EFF]/10 flex items-center justify-center text-[#6C8EFF]">
                <ShieldCheck size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>2. Confidentiality</h2>
            </div>
            <p className="text-[#8A8A9A] leading-relaxed">
              StartHub is a private network. All pitch decks, financial information, and investor theses 
              shared through the platform are strictly confidential. Any unauthorized disclosure of 
              third-party proprietary info may result in immediate account termination.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6C8EFF]/10 flex items-center justify-center text-[#6C8EFF]">
                <AlertCircle size={20} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>3. No Financial Advice</h2>
            </div>
            <p className="text-[#8A8A9A] leading-relaxed">
              StartHub is a matching platform. We do not provide financial, investment, or legal advice. 
              All users are encouraged to perform their own due diligence before entering into any 
              investment agreements.
            </p>
          </section>

          <section className="pt-8 border-t border-white/[0.05] text-center">
            <p className="text-[#555]" style={{ fontSize: "13px" }}>
              By continuing to use StartHub, you agree to these terms in full.
            </p>
          </section>
        </GlassCard>
      </div>
    </div>
  );
}

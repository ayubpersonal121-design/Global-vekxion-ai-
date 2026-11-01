import React from 'react';
import { X, ShieldCheck, Lock, FileText, CheckCircle, EyeOff, Server, Database, Sparkles } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = React.useState<'privacy' | 'terms'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#171717] border border-neutral-800 rounded-3xl shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sky-400">
              {activeTab === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                VEXION AI · Legal & Governance
              </h2>
              <span className="text-xs text-neutral-400">
                Mirrored from official Google & OpenAI transparency standards
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-2 border-b border-neutral-800 flex items-center gap-2 bg-[#171717]">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Privacy Policy (Kebijakan Privasi)
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'terms'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Terms of Service (Ketentuan Layanan)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm leading-relaxed text-neutral-300">
          {activeTab === 'privacy' ? (
            <div className="space-y-6">
              {/* Highlight Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#1f1f1f] border border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>Absolute Encryption</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    AES-256 rest-encryption and TLS 1.3 transport security matching enterprise Google Cloud standards.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#1f1f1f] border border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <EyeOff className="w-4 h-4" />
                    <span>Non-Disclosure Context</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Zero selling or monetization of personal chat context or proprietary prompts to third-party brokers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#1f1f1f] border border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Strict Cookie Consent</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    Zero cross-site trackers or invasive beacons. Essential cryptographic session tokens only.
                  </p>
                </div>
              </div>

              {/* Comprehensive Policy Text */}
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">1. Introduction & Scope</h3>
                <p>
                  VEXION AI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your personal privacy, corporate intellectual property, and user communications. This Privacy Policy specifies how your information is safeguarded when interacting with our AI conversational interface, automated advertising engines, and code synthesis workspaces, in accordance with ISO/IEC 27001, GDPR, and Indonesian personal data protection regulations (UU PDP No. 27/2022).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">2. Absolute Data Encryption & Security</h3>
                <p>
                  Every prompt, generated advertisement, code repository, and visual artifact is protected through end-to-end multi-layer cryptographic safeguards:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-2">
                  <li><strong>Data in Transit:</strong> Encrypted using TLS 1.3 with forward secrecy.</li>
                  <li><strong>Data at Rest:</strong> Encrypted using industry-standard AES-256 with hardware security module (HSM) key rotations.</li>
                  <li><strong>Ephemeral Sandbox Isolation:</strong> Interactive web apps and code executions run within hermetically sealed, memory-isolated sandboxes.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">3. Non-Disclosure & Model Training Boundaries</h3>
                <p>
                  Mirroring OpenAI API & Google Cloud enterprise confidentiality commitments:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-2">
                  <li>Your private inputs, advertising strategies, and custom business campaigns are <strong>NEVER used to train foundational AI models</strong> without explicit opt-in agreement.</li>
                  <li>We do not sell, rent, or lease your chat history, user identifier, or payment logs to third-party ad networks or data brokers.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">4. Strict Cookie & Local Storage Protection</h3>
                <p>
                  VEXION AI utilizes minimal, privacy-first client storage (`localStorage` and essential session tokens) solely to preserve your chat history locally on your device, record your active tier status, and maintain offline PWA caching. We do not place third-party advertising tracking cookies or invasive cross-site fingerprinting scripts.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">5. Usage Logs & Audit Trail Governance</h3>
                <p>
                  Operational logs (such as request timestamps, token metrics, and diagnostic status flags) are retained for system reliability, anti-abuse prevention, and billing verification. Transaction tokens (e.g., `#AI-PRO-XXXXXX`) logged for manual GoPay / DANA verification are safeguarded against unauthorized tampering and reviewed only by authorized administrators.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">6. User Rights & Data Erasure</h3>
                <p>
                  You possess the absolute right to clear your entire local chat archive, reset your workspace, or request transaction log purging at any time via the sidebar or by contacting our team via WhatsApp.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">1. Acceptance of Terms</h3>
                <p>
                  By accessing or utilizing VEXION AI, you confirm that you have read, comprehended, and agreed to be governed by these Terms of Service. If you do not accept these provisions, you must refrain from using the platform.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">2. Permitted Use & Ethical Guardrails</h3>
                <p>
                  VEXION AI is designed for professional conversational assistance, advertising copywriting, creative marketing strategy, and software prototyping. You agree not to engage in:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-2">
                  <li>Generation of deceptive, fraudulent, or defamatory advertising materials.</li>
                  <li>Automated scraping, denial-of-service attempts, or reverse engineering of backend inference endpoints.</li>
                  <li>Distribution of malware, exploits, or unverified regulatory compliance advice.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">3. Free Tier Limits & Premium Licensing (Anti-Leak Guarantee)</h3>
                <p>
                  Free accounts receive an allocated quota of 3 messages per session. Continued usage, high-tier reasoning engines, live sandbox deployment, and advanced multimodal features require a Premium License activation. Manual payment verification through GoPay (`089654886223`) or DANA Barcode generates a unique 6-digit transaction token (`#AI-PRO-XXXXXX`).
                </p>
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs space-y-1">
                  <strong>Jaminan Keamanan & Perlindungan Developer:</strong>
                  <p>
                    Developer (Ayyub Kenda Pratama) <strong>tidak pernah membagikan password master admin atau kode backdoor kepada siapa pun</strong>. Pengguna yang membeli paket premium menerima lisensi resmi melalui persetujuan transaksi langsung di sistem atau melalui <em>Kode Lisensi Sekali Pakai (One-Time License)</em> yang langsung hangus setelah dipakai di perangkat pengguna.
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">4. Developer Confidentiality & Absolute Privacy</h3>
                <p>
                  Seluruh kode khusus pengembang, master credentials, dan privasi pribadi pemilik dilindungi secara mutlak. Pengguna dilarang keras mencoba melakukan inspeksi backdoor, dekompilasi, reverse-engineering, atau menuntut kredensial pengembang. Segala data pribadi pembuat di luar kanal komunikasi bisnis resmi dilindungi oleh hukum dan tidak boleh disebarluaskan.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">4. Intellectual Property & Output Ownership</h3>
                <p>
                  To the maximum extent permitted by law, you retain ownership of the inputs you provide and receive commercial rights to the advertising copy, code snippets, and designs generated for your specific prompts.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white">5. AI Disclaimer & Limitation of Liability</h3>
                <p>
                  Generative artificial intelligence outputs are synthesized probabilistically. Users are advised to review and test advertising copy, legal disclaimers, and software code prior to production distribution. In no event shall VEXION AI or its operators be liable for indirect, incidental, or consequential damages.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Policy Status: Active & Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors cursor-pointer w-full sm:w-auto text-center"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};

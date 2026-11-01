import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  User, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  KeyRound,
  Mail
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: { name: string; email: string; isAdmin: boolean }) => void;
  language: 'id' | 'en';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language,
}) => {
  if (!isOpen) return null;
  const isId = language !== 'en';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(isId ? 'Harap masukkan alamat email atau username.' : 'Please enter an email or username.');
      return;
    }

    const isAdmin = password.trim() === 'YubAdmin2026!';
    const userName = name.trim() || email.split('@')[0] || (isAdmin ? 'Admin Ayyub' : 'Pengguna AI');

    const userData = {
      name: userName,
      email: email.trim(),
      isAdmin,
    };

    try {
      localStorage.setItem('globalpixel_user_v2', JSON.stringify(userData));
    } catch (e) {}

    onClose();
    // Trigger the terms requirements pop up upon login
    onLoginSuccess(userData);
  };

  const handleQuickLogin = () => {
    const defaultUser = {
      name: 'Pengguna Pixel AI',
      email: 'user@pixelai.id',
      isAdmin: false,
    };
    try {
      localStorage.setItem('globalpixel_user_v2', JSON.stringify(defaultUser));
    } catch (e) {}

    onClose();
    onLoginSuccess(defaultUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 p-[1.5px] shadow-xl mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <LogIn className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {isRegisterMode ? (isId ? 'Daftar Akun Baru' : 'Create Account') : (isId ? 'Masuk ke Akun Anda' : 'Sign in to Account')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            VEXION AI · Developer: <strong className="text-slate-200">Ayyub Kenda Pratama</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isId ? 'Nama Lengkap' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isId ? 'Nama Anda...' : 'Your name...'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isId ? 'Email atau Username' : 'Email or Username'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {isId ? 'Password' : 'Password'}
              </label>
              <span className="text-[10px] text-amber-400/90 font-mono">
                Admin: YubAdmin2026!
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-950/60 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isRegisterMode ? (isId ? 'Daftar & Masuk' : 'Sign Up') : (isId ? 'Masuk Sekarang' : 'Sign In')}</span>
          </button>
        </form>

        {/* Quick Login button */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={handleQuickLogin}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isId ? 'Masuk Cepat Sebagai Pengguna' : 'Quick Guest Sign In'}</span>
          </button>

          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="mt-3 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            {isRegisterMode
              ? (isId ? 'Sudah punya akun? Masuk di sini' : 'Already have an account? Sign in')
              : (isId ? 'Belum punya akun? Daftar di sini' : "Don't have an account? Sign up")}
          </button>
        </div>
      </div>
    </div>
  );
};

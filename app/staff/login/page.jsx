'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function StaffLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuth(data.token, data.staff);
      router.replace('/staff');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="mb-12 text-center">
        <img src="/logo.jpg" alt="Tea Corps" className="w-20 h-20 object-contain mx-auto mb-3" />
        <p className="text-[10px] font-label tracking-[0.2em] text-on-surface-variant uppercase">Staff Portal</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-ambient p-8">
        <h2 className="font-serif text-2xl text-on-surface mb-1">Welcome back</h2>
        <p className="text-on-surface-variant text-sm mb-8">Sign in to access the staff dashboard.</p>

        {error && (
          <div className="mb-6 px-4 py-3 bg-error-container/30 border border-error/20 rounded-xl text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="staff@teacorps.in"
                className="w-full bg-transparent border-b border-outline-variant/40 py-2 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-outline-variant/40 py-2 text-on-surface text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-tr from-primary to-primary-container text-on-primary rounded-xl font-medium text-sm tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 mt-4"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">login</span>
                SIGN IN
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-on-surface-variant/40">
        Tea Corp Hotel Management System
      </p>
    </div>
  );
}

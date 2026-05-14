import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Globe2,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/auth-context.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/qpms-india/', icon: Linkedin },
  { label: 'Website', href: 'https://qpms.in/', icon: Globe2 },
  { label: 'Instagram', href: 'https://www.instagram.com/qpms.in/', icon: Instagram },
  { label: 'Email', href: 'mailto:info@qpms.in', icon: Mail },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWelcoming, setIsWelcoming] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  usePageTitle('Sign in');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const normalizedUsername = username.trim().toLowerCase();

    if (!['admin', 'admin@qpms.com'].includes(normalizedUsername) || password !== 'admin') {
      setError('Use admin and admin for the sample login.');
      setIsSubmitting(false);
      return;
    }

    const nextUser = {
      name: 'Admin',
      username: 'admin',
      email: 'admin@qpms.com',
      role: 'Admin',
    };

    window.setTimeout(() => {
      setUser(nextUser);
      setIsSubmitting(false);
      setIsWelcoming(true);

      window.setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1700);
    }, 650);
  }

  const welcomeText = username ? `Welcome, ${username.trim().toLowerCase() === 'admin' ? 'Admin' : username.trim()}` : 'Welcome to QPMS CRM';

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(85,132,255,0.48),transparent_28%),radial-gradient(circle_at_28%_72%,rgba(46,95,231,0.30),transparent_32%),radial-gradient(circle_at_78%_76%,rgba(255,255,255,0.72),transparent_34%),linear-gradient(135deg,#14235f_0%,#2444a4_38%,#edf4ff_78%,#ffffff_100%)]" />
      <Motion.div
        animate={{ opacity: [0.28, 0.46, 0.28], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-300/26 blur-3xl"
      />
      <Motion.div
        animate={{ opacity: [0.16, 0.32, 0.16], y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-qpms-300/24 blur-3xl"
      />
      <div className="absolute right-16 top-20 h-96 w-96 rounded-full bg-white/64 blur-3xl" />

      <section className="relative flex min-h-screen items-center justify-center px-5 py-8">
        <Motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-[460px]"
        >
          <div className="mb-7 flex justify-center">
            <div className="rounded-2xl border border-white/28 bg-white/18 p-3 shadow-[0_20px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
              <Logo className="h-12 w-12" textClassName="[&_p]:text-2xl [&_p]:text-white" />
            </div>
          </div>

            <Motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            className="rounded-[2rem] border border-white/72 bg-white/78 p-6 shadow-[0_34px_110px_rgba(15,23,42,0.20)] backdrop-blur-2xl sm:p-8"
            >
              <div className="flex items-center gap-2 rounded-full bg-qpms-50 px-3 py-1.5 text-xs font-semibold text-qpms-700 ring-1 ring-qpms-100 w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                QPMS CRM v1.0
              </div>

              <div className="mt-7">
                <h2 className="text-[32px] font-semibold leading-tight tracking-normal text-slate-950">Welcome back</h2>
                <p className="mt-3 text-[15px] font-normal leading-7 text-slate-600">
                  Secure operational access for QPMS workforce platform
                </p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                  <span className="relative mt-2 block">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Type your mail id here"
                      autoComplete="username"
                      className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white/82 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-qpms-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,130,251,0.16),0_12px_30px_rgba(36,68,164,0.08)]"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Password</span>
                  <span className="relative mt-2 block">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Type password here"
                      autoComplete="current-password"
                      className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white/82 pl-11 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-qpms-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,130,251,0.16),0_12px_30px_rgba(36,68,164,0.08)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </span>
                </label>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-qpms-600 focus:ring-qpms-500"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-sm font-semibold text-qpms-600 transition hover:text-qpms-700">
                    Forgot password?
                  </button>
                </div>

                {error ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="focus-ring group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-qpms-600 text-sm font-semibold text-white shadow-lg shadow-qpms-600/24 transition duration-200 hover:-translate-y-0.5 hover:bg-qpms-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Verifying access
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-200/80 pt-5 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure access protected for QPMS operations
              </div>
            </Motion.div>

          <div className="mt-7 text-center">
            <p className="text-xs font-semibold uppercase text-white/70">Connect with QPMS</p>
            <div className="mt-3 flex justify-center gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={item.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  aria-label={item.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/18 bg-white/16 text-white/78 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/24 hover:text-white hover:shadow-[0_0_28px_rgba(147,197,253,0.30)]"
                >
                  <item.icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>
          </Motion.div>
      </section>

      {isWelcoming ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-5 backdrop-blur-sm">
          <div className="animate-[welcome-pop_260ms_ease-out] rounded-3xl border border-slate-200 bg-white px-8 py-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <Check className="h-8 w-8 animate-[check-draw_700ms_ease-out]" strokeWidth={3} />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-normal text-slate-950">{welcomeText}</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Opening your QPMS CRM dashboard...</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

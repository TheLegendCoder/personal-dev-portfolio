'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// useSearchParams must be wrapped in Suspense
export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    // Validate the redirect target to prevent open-redirect attacks.
    // Only allow relative paths that start with /admin; discard anything else.
    const raw = searchParams.get('redirectedFrom') ?? '';
    const redirectTo = raw.startsWith('/admin') && !raw.startsWith('//') ? raw : '/admin/blog';
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (decorative, desktop only) ───────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-accent flex-col justify-between p-12 overflow-hidden">
        {/* Noise texture overlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* Top brand */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Lock className="h-4.5 w-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <span className="font-semibold text-white text-sm tracking-wide">TN Studio</span>
        </div>

        {/* Centred quote */}
        <div className="relative space-y-4">
          <blockquote className="text-3xl font-bold text-white leading-snug">
            Ship systems,<br />not just features.
          </blockquote>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            Content management console for Tsholofelo Ndawonde&apos;s portfolio. Restricted access.
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="relative text-white/50 text-xs">
          © {new Date().getFullYear()} Tsholofelo Ndawonde
        </p>

        {/* Decorative circle */}
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
      </div>

      {/* ── Right panel (form) ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="space-y-1.5">
            {/* Mobile-only icon + brand (hidden on lg where left panel shows) */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm text-foreground">TN Studio</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your content</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-11 focus-visible:ring-primary"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11 focus-visible:ring-primary"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

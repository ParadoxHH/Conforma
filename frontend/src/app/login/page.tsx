'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sanitizeEmail = (value: string) => value.trim().toLowerCase();

function LoginComponent() {
  const { user, loading, login, createAccount } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'create'>(() =>
    searchParams.get('mode') === 'signup' ? 'create' : 'login',
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState<'homeowner' | 'contractor'>('homeowner');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirect = useMemo(() => searchParams.get('redirect') || '/dashboard/profile', [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [loading, user, redirect, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const email = sanitizeEmail(loginEmail);

    if (!email) {
      setError('Please enter the email associated with your account.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email });
      router.replace(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in with those details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const name = createName.trim();
    const email = sanitizeEmail(createEmail);

    if (!name || !email) {
      setError('Please share both your name and email so we can set up your workspace.');
      return;
    }

    setSubmitting(true);
    try {
      await createAccount({
        name,
        email,
        role: createRole,
      });
      router.replace(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white/80">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 px-10 py-8 shadow-lg shadow-slate-900/10 backdrop-blur">
          <p className="text-sm font-medium text-slate-600">Preparing your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white/80 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-lg shadow-slate-900/10 backdrop-blur md:p-10">
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Access Conforma</span>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Log in or create your workspace</h1>
            <p className="mt-2 text-sm text-slate-600">
              Use your email to log in if you already have access. New to Conforma? Create your homeowner or contractor
              workspace in one step.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'create')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="create">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Signing you in...' : 'Continue to dashboard'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <form className="space-y-6" onSubmit={handleCreateAccount}>
                <div className="space-y-2">
                  <Label htmlFor="create-name">Full name</Label>
                  <Input
                    id="create-name"
                    autoComplete="name"
                    placeholder="Jane Contractor"
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Work email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="team@company.com"
                    value={createEmail}
                    onChange={(event) => setCreateEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">I’m joining as a</Label>
                  <Select value={createRole} onValueChange={(value) => setCreateRole(value as 'homeowner' | 'contractor')}>
                    <SelectTrigger id="create-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homeowner">Homeowner</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Creating your workspace...' : 'Create account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error ? <p className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

          <div className="mt-8 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-600">
            <p>
              Have questions about onboarding?{' '}
              <Link href="/contact" className="font-semibold text-primary hover:underline">
                Talk with our team
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginComponent />
    </Suspense>
  );
}

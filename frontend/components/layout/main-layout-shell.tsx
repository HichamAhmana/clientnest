'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import { BarChart3, Briefcase, FileText, LogOut, Users } from 'lucide-react';
import { clearAccessToken, isAuthenticated } from '../../lib/auth-client';

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/invoices', label: 'Invoices', icon: FileText },
];

export function MainLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Simple client-side auth guard
  useEffect(() => {
    const isAuthRoute =
      pathname?.startsWith('/(auth)/login') ||
      pathname?.startsWith('/(auth)/register');

    if (!isAuthRoute && !isAuthenticated()) {
      router.push('/(auth)/login');
    }
  }, [pathname, router]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 flex-col border-r bg-card/60 p-4 md:flex">
        <div className="mb-6 text-xl font-semibold">ClientNest</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1">
        <header className="border-b bg-card/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              Clarity, control, and cash flow visibility.
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              onClick={() => {
                clearAccessToken();
                router.push('/(auth)/login');
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}


'use client';

import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { MainLayoutShell } from '@/components/layout/main-layout-shell';

export default function DashboardPage() {
  return (
    <MainLayoutShell>
      <DashboardOverview />
    </MainLayoutShell>
  );
}
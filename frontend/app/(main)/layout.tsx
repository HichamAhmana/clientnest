import { ReactNode } from 'react';
import { MainLayoutShell } from '../../components/layout/main-layout-shell';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <MainLayoutShell>{children}</MainLayoutShell>;
}
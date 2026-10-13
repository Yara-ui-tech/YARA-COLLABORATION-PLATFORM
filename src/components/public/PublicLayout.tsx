import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import MobileBottomNav from './MobileBottomNav';
import { OfflineBanner } from '../OfflineBanner';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white pb-16 md:pb-0">
      <OfflineBanner />
      <PublicHeader />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
}

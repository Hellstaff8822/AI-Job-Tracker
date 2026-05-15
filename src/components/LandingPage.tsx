// src/components/LandingPage.tsx

'use client';

import { useJobStore } from '@/store/useJobStore';
import { translations } from '@/lib/i18n';
import { SignInButton } from '@clerk/nextjs';

export function LandingPage() {
  const { language } = useJobStore();
   const t = translations[language].landing;
  return (
    <div className='min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden'>
      <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]' />

      <div className='max-w-2xl w-full text-center space-y-10 relative z-10'>
        <div className='space-y-4'>
          <h1 className='text-7xl md:text-8xl font-black tracking-tighter leading-none'>
            {t.title}
            <br />
            <span className='text-slate-600'>{t.subtitle}</span>
          </h1>
          <p className='text-slate-500 text-lg font-medium'>
            {t.description}
          </p>
        </div>

        <div className='pt-6'>
          <SignInButton mode='modal'>
            <button className='px-12 py-6 bg-white cursor-pointer text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl shadow-blue-500/10'>
              {t.button}
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}

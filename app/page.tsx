'use client';

import { JobInputForm } from '@/components/JobInputForm';
import { KanbanBoard } from '@/components/KanbanBoard';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

export default function JobTrackerPage() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <main className='min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-blue-500/30 overflow-y-auto'>
      <div className='fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none' />
      <div className='fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none' />

      <div className='relative z-10 max-w-[1920px] mx-auto flex flex-col p-4 md:p-8 pb-32 lg:pb-0 lg:h-screen lg:overflow-hidden'>
        {' '}
        <header className='flex justify-between items-end mb-12'>
          <div>
            <h1 className='text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent leading-none'>
              JOB TRACKER
            </h1>
            <p className='text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3 ml-1'>
              AI Powered Assistant
            </p>
          </div>

          <div className='flex items-center gap-4 min-w-[120px] justify-end pb-1'>
            {!isLoaded ? (
              <div className='w-10 h-10 rounded-full bg-white/5 animate-pulse border border-white/10' />
            ) : !isSignedIn ? (
              <SignInButton mode='modal'>
                <button className='px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-blue-500/10'>
                  Увійти
                </button>
              </SignInButton>
            ) : (
              <div className='w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[1.5px] hover:rotate-12 transition-transform duration-500'>
                <div className='w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center overflow-hidden'>
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: 'w-full h-full',
                        userButtonTrigger: 'focus:shadow-none',
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </header>
        <div className='flex flex-col lg:flex-row gap-8 flex-1 lg:overflow-hidden'>
          <section className='w-full lg:w-[320px] shrink-0'>
            <JobInputForm />
          </section>

          <section className='w-full lg:flex-1 min-h-[500px] lg:h-full bg-[#121212]/80 backdrop-blur-xl p-4 lg:p-6 rounded-[2.5rem] shadow-2xl border border-white/5 ring-1 ring-white/5 overflow-hidden flex flex-col'>
            <KanbanBoard />
          </section>
        </div>
      </div>
    </main>
  );
}

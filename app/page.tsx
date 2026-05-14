import { JobInputForm } from '@/components/JobInputForm';
import { KanbanBoard } from '@/components/KanbanBoard';

export default function JobTrackerPage() {
  return (
    <main className='h-screen bg-[#0a0a0a] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30 overflow-hidden'>
      <div className='fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none' />
      <div className='fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none' />

      <div className='relative z-10 max-w-[1920px] mx-auto flex flex-col h-full'>
        <header className='mb-8 shrink-0'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-white tracking-tight'>
            AI Job Tracker{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500'>
              Pro
            </span>
          </h1>
          <p className='text-slate-400 mt-2 text-lg font-medium'>
            Автоматизуй свій пошук роботи з AI.
          </p>
        </header>

        <div className='flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden items-start'>
          <section className='w-full lg:w-[320px] shrink-0'>
            <JobInputForm />
          </section>
          <section className='w-full lg:flex-1 h-full bg-[#121212]/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/5 ring-1 ring-white/5 overflow-hidden flex flex-col'>
            <KanbanBoard />
          </section>
        </div>
      </div>
    </main>
  );
}

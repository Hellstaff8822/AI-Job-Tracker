'use client';

import React, { useState } from 'react';
import { parseAndSaveJob } from '@/actions/job';
import { useJobStore } from '@/store/useJobStore';
import { toast } from 'sonner';

import { Loader2, Search } from 'lucide-react';

export function JobInputForm() {
  const [jobUrl, setJobUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addJob = useJobStore((state) => state.addJob);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const newJob = await parseAndSaveJob(jobUrl);

      addJob(newJob as any);

      setJobUrl('');
      toast.success('Вакансію успішно додано! ✨');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-5 bg-[#121212]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl ring-1 ring-white/5 transition-all duration-300 hover:border-white/10 focus-within:border-blue-500/30 focus-within:ring-blue-500/10'
    >
      <div>
        <label
          htmlFor='jobUrl'
          className='block text-sm font-semibold text-slate-300 mb-3'
        >
          Посилання на вакансію
        </label>
        <input
          id='jobUrl'
          type='url'
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          disabled={isLoading}
          placeholder='https://djinni.co/jobs/...'
          className='w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50'
          required
        />
      </div>

      <button
        type='submit'
        disabled={isLoading || !jobUrl.trim()}
        className='w-full cursor-pointer py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.5)] relative overflow-hidden'
      >
        {isLoading ? (
          <div className='flex items-center justify-center gap-2'>
            <Loader2 className='w-4 h-4 animate-spin text-white/80' />
            <span className='animate-pulse'>Аналізую...</span>
          </div>
        ) : (
          <div className='flex items-center justify-center gap-2'>
            <span>Add Job</span>
            <span className='animate-pulse'>✨</span>
          </div>
        )}

        {isLoading && (
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]' />
        )}
      </button>

      <p className='text-xs text-slate-500 text-center mt-1'>
        Підтримуються Djinni, DOU та LinkedIn
      </p>
    </form>
  );
}

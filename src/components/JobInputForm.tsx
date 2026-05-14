'use client';

import React, { useState } from 'react';
import { parseAndSaveJob } from '@/actions/job';
import { useJobStore } from '@/store/useJobStore';
import { toast } from 'sonner';

import { getUrlsValidationStatus } from '@/constants/domains';

import {
  Loader2,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function JobInputForm() {
  const [jobUrl, setJobUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addJob = useJobStore((state) => state.addJob);

  const validationStatus = getUrlsValidationStatus(jobUrl);

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
          className={`w-full p-4 bg-white/5 border rounded-xl transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50 ${
            validationStatus === 'verified'
              ? 'border-green-500/30 focus:border-green-500/50'
              : validationStatus === 'experimental'
                ? 'border-yellow-500/30 focus:border-yellow-500/50'
                : validationStatus === 'invalid'
                  ? 'border-red-500/30 focus:border-red-500/50'
                  : 'border-white/10 focus:border-blue-500/30'
          }`}
          required
        />

        <div className='mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-200'>
          {validationStatus === 'verified' && (
            <p className='text-[10px] text-green-500/80 font-bold uppercase tracking-wider flex items-center gap-1.5'>
              <CheckCircle2 className='w-3.5 h-3.5' /> Офіційна підтримка
            </p>
          )}
          {validationStatus === 'experimental' && (
            <p className='text-[10px] text-yellow-500/80 font-bold uppercase tracking-wider flex items-center gap-1.5'>
              <AlertCircle className='w-3.5 h-3.5' /> Експериментально (ШІ
              спробує розібрати)
            </p>
          )}
          {validationStatus === 'invalid' && jobUrl.length > 0 && (
            <p className='text-[10px] text-red-500/80 font-bold uppercase tracking-wider flex items-center gap-1.5'>
              <XCircle className='w-3.5 h-3.5' /> Некоректний URL
            </p>
          )}
        </div>
      </div>

      <button
        type='submit'
        disabled={
          isLoading ||
          validationStatus === 'invalid' ||
          validationStatus === 'idle'
        }
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

'use client';

import { useState } from 'react';
import { parseAndSaveJob } from '@/actions/job';
import { useJobStore } from '@/store/useJobStore';
import { toast } from 'sonner';
import { Job } from '@/types/job';

import { translations } from '@/lib/i18n';

import { getUrlsValidationStatus } from '@/constants/domains';

import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function JobInputForm() {
  const [jobUrl, setJobUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addJob = useJobStore((state) => state.addJob);
   const { language } = useJobStore();
   const t = translations[language].form; 

  const validationStatus = getUrlsValidationStatus(jobUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await parseAndSaveJob(jobUrl, language);

      if (!res.success) {
        toast.error(res.error);
        return;
      }

    addJob(res.job as unknown as Job);

      setJobUrl('');
      toast.success(translations[language].notifications.jobAdded);
    } catch (error: unknown) {
      console.error('Job submission error:', error);
      toast.error(
        language === 'ua'
          ? 'Помилка зв’язку із сервером. Спробуйте пізніше.'
          : 'Error connecting to the server. Please try again later.'
      );
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
          {t.label}
        </label>
        <input
          id='jobUrl'
          type='url'
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          disabled={isLoading}
          placeholder={t.placeholder}
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
              <CheckCircle2 className='w-3.5 h-3.5' /> {t.verified}
            </p>
          )}
          {validationStatus === 'experimental' && (
            <p className='text-[10px] text-yellow-500/80 font-bold uppercase tracking-wider flex items-center gap-1.5'>
              <AlertCircle className='w-3.5 h-3.5' /> {t.experimental}
            </p>
          )}
          {validationStatus === 'invalid' && jobUrl.length > 0 && (
            <p className='text-[10px] text-red-500/80 font-bold uppercase tracking-wider flex items-center gap-1.5'>
              <XCircle className='w-3.5 h-3.5' /> {t.invalid}
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
            <span className='animate-pulse'>{t.parsing}</span>
          </div>
        ) : (
          <div className='flex items-center justify-center gap-2'>
            <span>{t.button}</span>
            <span className='animate-pulse'>✨</span>
          </div>
        )}

        {isLoading && (
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]' />
        )}
      </button>

      <p className='text-xs text-slate-500 text-center mt-1'>
        {t.footer}
      </p>
    </form>
  );
}

'use client';

import { useEffect } from 'react';
import { useJobStore } from '@/store/useJobStore';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useJobStore();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className='flex items-center gap-2 bg-white/5 p-1 pl-2 rounded-xl border border-white/10 backdrop-blur-md'>
      <Languages className='w-3.5 h-3.5 text-slate-500' />

      <div className='flex items-center gap-1'>
        <button
          onClick={() => setLanguage('ua')}
          className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all duration-300 cursor-pointer ${
            language === 'ua'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          UA
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all duration-300 cursor-pointer ${
            language === 'en'
              ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}

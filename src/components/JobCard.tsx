'use client';

import { useDraggable } from '@dnd-kit/core';
import { Job } from '@/types/job';
import { MapPin, DollarSign, ExternalLink, Clock } from 'lucide-react';

import { useJobStore } from '@/store/useJobStore';
import { translations } from '@/lib/i18n';

interface JobCardProps {
  job: Job;
  onClick?: (job: Job) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

type CommonTranslationsKey = keyof typeof translations.ua.common;

const workFormatMap: Record<string, CommonTranslationsKey> = {
  'Remote': 'remote',
  'Office': 'office',
  'Hybrid': 'hybrid',
};

export function JobCard({ job, onClick, isDragging, isOverlay }: JobCardProps) {
  const { language } = useJobStore();
  const c = translations[language].common;
  
  const localizedWorkFormat = job.workFormat && workFormatMap[job.workFormat]
    ? c[workFormatMap[job.workFormat]]
    : job.workFormat || c.notSpecified;

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: job.id,
    disabled: !!isOverlay,
  });

  return (
    <div
      ref={setNodeRef}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={(e) => {
        if (isOverlay) return;
        if ((e.target as HTMLElement).closest('a')) return;
        onClick?.(job);
      }}
      className={`relative group bg-[#1e293b]/80 border p-4 rounded-2xl 
        ${isOverlay ? '' : 'transition-all duration-200'} 
        ${
          isOverlay
            ? 'z-[100] cursor-grabbing border-blue-500 shadow-2xl shadow-blue-500/40 scale-[1.02] bg-[#1e293b] ring-2 ring-blue-500/20'
            : 'cursor-grab border-slate-700/50 hover:border-blue-500/40'
        }
        ${isDragging && !isOverlay ? 'opacity-20' : 'opacity-100'}
        ${!isDragging && !isOverlay ? 'hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]' : ''}
      `}
    >
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0 overflow-hidden'>
            {job.logoUrl ? (
              <img
                src={job.logoUrl}
                alt={job.company}
                className='w-full h-full object-cover'
              />
            ) : (
              <span className='text-lg'>{job.company.charAt(0)}</span>
            )}
          </div>
          <div className='min-w-0'>
            <h3 className='font-bold text-slate-50 text-base leading-tight group-hover:text-blue-400 transition-colors truncate'>
              {job.company}
            </h3>
            <p className='text-xs text-slate-400 flex items-center gap-1 mt-1 truncate'>
              <Clock className='w-3 h-3' />
              {job.position}
            </p>
          </div>
        </div>
        {!isOverlay && (
          <a
            href={job.url}
            target='_blank'
            rel='noopener noreferrer'
            className='p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all shrink-0'
          >
            <ExternalLink className='w-4.5 h-4.5' />
          </a>
        )}
      </div>

      <div className='flex flex-wrap gap-1.5 mb-5'>
        {job.technologies.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className='px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-300 rounded-md border border-blue-500/10'
          >
            {tech}
          </span>
        ))}
        {job.technologies.length > 4 && (
          <span className='px-2 py-0.5 text-[10px] font-medium bg-slate-700/50 text-slate-500 rounded-md'>
            +{job.technologies.length - 4}
          </span>
        )}
      </div>

      <div className='flex items-center justify-between pt-4 border-t border-slate-700/50'>
        <div className='flex items-center gap-4 text-[11px] text-slate-300 font-medium'>
          <div className='flex items-center gap-1.5'>
            <DollarSign className='w-3.5 h-3.5 text-emerald-500' />
            <span>{job.salary === 'Competitive' ? c.competitive : (job.salary || c.notSpecified)}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <MapPin className='w-3.5 h-3.5 text-blue-500' />
            <span>{localizedWorkFormat}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

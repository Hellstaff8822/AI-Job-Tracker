'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { JobStatus } from '@/types/job';

const COLUMN_THEMES: Record<JobStatus, string> = {
  Backlog: 'text-blue-400',
  Contacted: 'text-yellow-400',
  Screening: 'text-purple-400',
  'Tech Interview': 'text-indigo-400',
  'Offer/Reject': 'text-green-400',
};

interface KanbanColumnProps {
  id: JobStatus;
  title: string; 
  children?: React.ReactNode;
}

export function KanbanColumn({
  id,
  title,
  children,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const count = React.Children.count(children);
  const colorClass = COLUMN_THEMES[id] || 'text-slate-400';
  
  return (
    <div className='flex-1 min-w-[340px] flex flex-col h-full bg-[#161616]/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-6 transition-all duration-500 hover:border-white/10 group/column'>
      <div className='flex items-center justify-between mb-8 px-1'>
        <div className='flex items-center gap-3'>
          <div
            className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text', 'bg')} shadow-[0_0_12px_rgba(59,130,246,0.3)] animate-pulse`}
          />
          <h2
            className={`text-[11px] font-black uppercase tracking-[0.3em] ${colorClass}`}
          >
            {title}
          </h2>
        </div>
        <span className='px-3 py-1 bg-white/5 rounded-xl text-[11px] font-black text-slate-500 border border-white/5 tabular-nums'>
          {count}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className='flex-1 flex flex-col gap-5 min-h-[400px] overflow-y-auto custom-scrollbar pb-4'
      >
        {children}
      </div>
    </div>
  );
}

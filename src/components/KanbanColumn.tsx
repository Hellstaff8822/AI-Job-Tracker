'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  title: string;
  count?: number;
  children?: React.ReactNode;
}

export function KanbanColumn({
  title,
  count = 0,
  children,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: title });

  return (
    <div className='flex flex-col h-full bg-[#1a1a1a]/40 backdrop-blur-md rounded-[2rem] border border-white/5 p-5'>
      {' '}
      <div className='flex items-center justify-between mb-6 px-2'>
        <h2 className='text-sm font-bold text-slate-400 uppercase tracking-widest'>
          {title}
        </h2>
        <span className='px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-500 border border-white/5'>
          {count}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className='flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar'
      >
        {children}
      </div>
    </div>
  );
}

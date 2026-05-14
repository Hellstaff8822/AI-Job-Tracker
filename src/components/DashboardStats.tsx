'use client';

import { useJobStore } from '@/store/useJobStore';
import { Briefcase, Users, Award, TrendingUp } from 'lucide-react';

export function DashboardStats() {
  const jobs = useJobStore((state) => state.jobs);

const stats = [
  {
    label: 'Всього',
    value: jobs.length,
    icon: Briefcase,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    label: 'Інтерв’ю',
    value: jobs.filter(
      (j) => j.status === 'Tech Interview' || j.status === 'Screening'
    ).length,
    icon: Users,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    label: 'Фінал (O/R)',
    value: jobs.filter((j) => j.status === 'Offer/Reject').length,
    icon: Award,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    label: 'Відгуки',
    value: jobs.filter(
      (j) => j.status !== 'Backlog' && j.status !== 'Offer/Reject'
    ).length,
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className='p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-white/10 transition-all duration-300'
        >
          <div
            className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}
          >
            <stat.icon className='w-5 h-5' />
          </div>
          <div>
            <p className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5'>
              {stat.label}
            </p>
            <p className='text-2xl font-black text-white tabular-nums'>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

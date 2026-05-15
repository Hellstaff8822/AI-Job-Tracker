// src/store/useJobStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job, JobStatus, Note } from '@/types/job';
import { Language } from '@/lib/i18n';

interface JobState {
  jobs: Job[];
  language: Language;
  addJob: (job: Job) => void;
  setJobs: (jobs: Job[]) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  removeJob: (id: string) => void;
  addNote: (jobId: string, note: Note) => void;
  deleteNote: (jobId: string, noteId: string) => void;
  updateAIInsights: (id: string, insights: string) => void;
  setLanguage: (lang: Language) => void;
}


export const useJobStore = create<JobState>()(
  persist(
    (set) => ({
      jobs: [],
      language: 'ua',
      
      setLanguage: (lang) => set({ language: lang }),

      addJob: (job) =>
        set((state) => ({
          jobs: [job, ...state.jobs],
        })),

      setJobs: (jobs) => set({ jobs }),

      updateJobStatus: (id, status) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, status } : job
          ),
        })),

      removeJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        })),

      addNote: (jobId, note) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? { ...job, notes: [note, ...(job.notes || [])] }
              : job
          ),
        })),

      deleteNote: (jobId, noteId) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === jobId
              ? { ...job, notes: (job.notes || []).filter((n) => n.id !== noteId) }
              : job
          ),
        })),

      updateAIInsights: (id, insights) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, aiInsights: insights } : job
          ),
        })),
    }),
    { name: 'job-storage' } 
  )
);

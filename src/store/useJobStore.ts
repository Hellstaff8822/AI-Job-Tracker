import { create } from 'zustand';
import { Job, JobStatus, Note } from '@/types/job';

interface JobState {
  jobs: Job[];
  addJob: (job: Job) => void;
  setJobs: (jobs: Job[]) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  removeJob: (id: string) => void;
  addNote: (jobId: string, note: Note) => void;
  deleteNote: (jobId: string, noteId: string) => void;
  updateAIInsights: (id: string, insights: string) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],

  addJob: (job) =>
    set((state) => ({
      jobs: [job, ...state.jobs],
    })),

  setJobs: (jobs) => set({ jobs }),

 updateJobStatus: (id, status) =>
  set((state) => ({
    jobs: state.jobs.map((job) =>
      job.id === id
        ? {
            ...job,
            status,

            history: [
              {
                id: Math.random().toString(),
                jobId: id,
                status,
                createdAt: new Date().toISOString(),
              },
              ...(job.history || []),
            ],
          }
        : job
    ),
  })),

  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== id),
    })),

  addNote: (jobId, note) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, notes: [note, ...job.notes] } : job
      ),
    })),
  deleteNote: (jobId, noteId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId
          ? { ...job, notes: job.notes.filter((n) => n.id !== noteId) }
          : job
      ),
    })),

  updateAIInsights: (id, insights) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === id ? { ...job, aiInsights: insights } : job
      ),
    })),
}));

'use client';

import { useState, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';
import { JobModal } from './JobModal';
import { useJobStore } from '@/store/useJobStore';
import { JobStatus, Job } from '@/types/job';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { getJobsAction, updateJobStatusAction } from '@/actions/job';
import { toast } from 'sonner';

import { translations } from '@/lib/i18n';

export const COLUMNS: JobStatus[] = [
  'Backlog',
  'Contacted',
  'Screening',
  'Tech Interview',
  'Offer/Reject',
];

const COLUMN_KEYS: Record<string, string> = {
  Backlog: 'backlog',
  Contacted: 'contacted',
  Screening: 'screening',
  'Tech Interview': 'technical',
  'Offer/Reject': 'outcome',
};

export function KanbanBoard() {
  const { jobs, updateJobStatus, setJobs, language } = useJobStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const t = translations[language].kanban;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const loadJobs = async () => {
      const initialJobs = await getJobsAction();
      setJobs(initialJobs as any);
    };
    loadJobs();
  }, [setJobs]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const jobId = active.id as string;
    const newStatus = over.id as JobStatus;
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;
    const oldStatus = job.status; 
    updateJobStatus(jobId, newStatus);
    try {
      await updateJobStatusAction(jobId, newStatus);
    } catch (error) {
      updateJobStatus(jobId, oldStatus);
      toast.error(translations[language].notifications.statusUpdateError);
    }
  };

  const activeJob = jobs.find((j) => j.id === activeId);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[snapCenterToCursor]}
      >
        <div className='flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth flex gap-4 p-4 pb-10 lg:p-0 custom-scrollbar'>
          {COLUMNS.map((status) => (
            <div
              key={status}
              className='snap-center shrink-0 w-[85vw] md:w-[350px]'
            >
              <KanbanColumn
                key={status}
                title={(t as any)[COLUMN_KEYS[status]] || status}
              >
                {jobs
                  .filter((j) => j.status === status)
                  .map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isDragging={job.id === activeId}
                      onClick={setSelectedJob}
                    />
                  ))}
              </KanbanColumn>
            </div>
          ))}
        </div>
        <DragOverlay adjustScale={false}>
          {activeJob ? (
            <div className='z-[1000] pointer-events-none'>
              <JobCard job={activeJob} isOverlay={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={updateJobStatus}
        />
      )}
    </>
  );
}

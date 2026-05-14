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
import { snapCenterToCursor} from '@dnd-kit/modifiers';
import { getJobsAction } from '@/actions/job';

export const COLUMNS: JobStatus[] = [
  'Backlog',
  'Contacted',
  'Screening',
  'Tech Interview',
  'Offer/Reject',
];

export function KanbanBoard() {
  const { jobs, updateJobStatus, setJobs } = useJobStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    updateJobStatus(active.id as string, over.id as JobStatus);
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
        <div className='flex flex-row gap-6 h-full items-start overflow-x-auto pb-10 custom-scrollbar pt-4 px-2'>
          {COLUMNS.map((status) => (
             <KanbanColumn
              key={status}
              title={status}
              count={jobs.filter((j) => j.status === status).length}
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

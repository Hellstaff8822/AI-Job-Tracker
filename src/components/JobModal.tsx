'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Job, JobStatus } from '@/types/job';
import { COLUMNS } from './KanbanBoard';
import {
  deleteJobAction,
  addNoteAction,
  deleteNoteAction,
  generateAIInsightsAction,
  updateJobStatusAction,
} from '@/actions/job';
import { useJobStore } from '@/store/useJobStore';
import { toast } from 'sonner';
import {
  X,
  Trash2,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Briefcase,
  MessageCircle,
  FileText,
  Plus,
  Sparkles,
  Wand2,
  BrainCircuit,
  History,
  Send,
  Users,
  Award,
  XCircle,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';

const STATUS_CONFIG: Record<
  string,
  { icon: any; color: string; label: string }
> = {
  Backlog: { icon: FileText, color: 'text-slate-400', label: 'Створено' },
  Applied: { icon: Send, color: 'text-blue-400', label: 'Відправлено' },
  Interview: { icon: Users, color: 'text-yellow-400', label: 'Інтерв’ю' },
  Offer: { icon: Award, color: 'text-green-400', label: 'Офер ✨' },
  Rejected: { icon: XCircle, color: 'text-red-400', label: 'Відмова' },
};

interface JobModalProps {
  job: Job;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: JobStatus) => void;
}

export function JobModal({
  job: initialJob,
  onClose,
  onStatusChange,
}: JobModalProps) {
  const job =
    useJobStore((state) => state.jobs.find((j) => j.id === initialJob.id)) ||
    initialJob;

  const [isMounted, setIsMounted] = useState(false);
 const [activeTab, setActiveTab] = useState<
   'details' | 'notes' | 'ai' | 'events'
 >('details');
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { removeJob, addNote, deleteNote, updateAIInsights, updateJobStatus } = useJobStore();

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isMounted) return null;

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const insights = await generateAIInsightsAction(job.id);
      updateAIInsights(job.id, insights || '');
      toast.success('ШІ підготував поради!');
    } catch (err) {
      toast.error('ШІ зараз відпочиває. Спробуй пізніше.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setIsAddingNote(true);
    try {
      const note = await addNoteAction(job.id, newNoteText);
      addNote(job.id, note);
      setNewNoteText('');
      toast.success('Нотатку додано');
    } catch (err) {
      toast.error('Помилка при додаванні');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteAction(noteId);
      deleteNote(job.id, noteId);
      toast.success('Видалено');
    } catch (err) {
      toast.error('Помилка видалення');
    }
  };

  const handleDeleteJob = async () => {
    setIsDeleting(true);
    try {
      await deleteJobAction(job.id);
      removeJob(job.id);
      toast.success('Вакансію видалено');
      onClose();
    } catch (error) {
      toast.error('Помилка при видаленні');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

 const handleStatusChange = async (status: JobStatus) => {
   const oldStatus = job.status;
   if (status === oldStatus) return;
   updateJobStatus(job.id, status);
   try {
     await updateJobStatusAction(job.id, status);
     toast.success(`Статус успішно змінено на ${status}`);
   } catch (error) {
     updateJobStatus(job.id, oldStatus);
     toast.error('Не вдалося оновити статус у базі даних');
   }
 };

  return createPortal(
    <div className='fixed inset-0 z-[2000] flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300'
        onClick={onClose}
      />
      <div className='relative bg-slate-900 border border-white/5 w-[95vw] max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]'>
        {' '}
        <div className='relative h-auto min-h-24 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-5 md:p-6 border-b border-white/5 shrink-0'>
          <div className='flex items-center gap-4 pr-10'>
            <div className='w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shadow-xl flex items-center justify-center shrink-0'>
              {job.logoUrl ? (
                <img
                  src={job.logoUrl}
                  alt={job.company}
                  className='w-full h-full object-cover'
                />
              ) : (
                <Building2 className='w-6 h-6 md:w-7 md:h-7 text-slate-600' />
              )}
            </div>
            <div className='min-w-0 flex-1'>
              <h2 className='text-lg md:text-xl font-bold text-white truncate tracking-tight'>
                {job.position}
              </h2>
              <a
                href={job.url || '#'}
                target='_blank'
                rel='noopener noreferrer'
                className='group inline-flex items-center gap-1.5 mt-0.5 cursor-pointer'
              >
                <p className='text-blue-400 group-hover:text-blue-300 font-medium text-xs md:text-sm transition-colors'>
                  {job.company}
                </p>
                <ExternalLink className='w-3 h-3 text-blue-500/50 group-hover:text-white transition-all group-hover:scale-110' />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className='absolute top-5 right-5 md:top-6 md:right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <div className='flex bg-slate-900/50 border-b border-white/5 shrink-0 h-14'>
          {[
            { id: 'details', label: 'Вакансія', icon: FileText, color: 'blue' },
            {
              id: 'notes',
              label: 'Нотатки',
              icon: MessageCircle,
              color: 'blue',
            },
            { id: 'ai', label: 'AI Помічник', icon: Sparkles, color: 'purple' },
            { id: 'events', label: 'Events', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex-1 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                activeTab === tab.id
                  ? tab.id === 'ai'
                    ? 'text-purple-400'
                    : 'text-blue-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className='relative'>
                <tab.icon className='w-5 h-5' />
                {tab.id === 'notes' && (job.notes?.length || 0) > 0 && (
                  <span className='absolute -top-1.5 -right-2.5 bg-blue-600 text-white text-[8px] font-black px-1 rounded-full min-w-[14px] h-[14px] flex items-center justify-center border-2 border-slate-900 shadow-lg'>
                    {job.notes?.length}
                  </span>
                )}
              </div>
              <span className='hidden sm:inline text-[9px] font-black uppercase tracking-widest mt-1'>
                {tab.label}
              </span>

              {activeTab === tab.id && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300 ${
                    tab.id === 'ai'
                      ? 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
        <div className='p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1'>
          {activeTab === 'details' && (
            <div className='space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='bg-white/[0.03] p-4 rounded-2xl border border-white/5'>
                  <p className='text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1'>
                    Бюджет
                  </p>
                  <div className='flex items-center gap-2 text-white font-bold leading-none'>
                    <DollarSign className='w-4 h-4 text-emerald-500' />
                    {job.salary || 'Не вказано'}
                  </div>
                </div>
                <div className='bg-white/[0.03] p-4 rounded-2xl border border-white/5'>
                  <p className='text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1'>
                    Локація
                  </p>
                  <div className='flex items-center gap-2 text-white font-bold leading-none'>
                    <MapPin className='w-4 h-4 text-blue-500' />
                    {job.workFormat}
                  </div>
                </div>
              </div>
              <div>
                <h3 className='text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2'>
                  <Briefcase className='w-3 h-3' /> Стек технологій
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {(job.technologies || []).map((tech) => (
                    <span
                      key={tech}
                      className='px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-white/5'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className='text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3'>
                  Про вакансію
                </h3>
                <div className='text-slate-400 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.01] p-5 rounded-2xl border border-white/5'>
                  {job.description}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300'>
              <div className='bg-white/[0.02] p-4 rounded-2xl border border-white/5'>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder='Додати нову нотатку...'
                  className='w-full bg-transparent border-none text-sm text-slate-300 focus:outline-none resize-none h-20 placeholder:text-slate-700'
                />
                <div className='flex justify-end mt-2'>
                  <button
                    onClick={handleAddNote}
                    disabled={isAddingNote || !newNoteText.trim()}
                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black rounded-xl cursor-pointer transition-all'
                  >
                    {isAddingNote ? (
                      '...'
                    ) : (
                      <>
                        <Plus className='w-3 h-3' /> ЗБЕРЕГТИ
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className='space-y-4'>
                {!job.notes || job.notes.length === 0 ? (
                  <div className='text-center py-12'>
                    <MessageCircle className='w-12 h-12 text-slate-800 mx-auto mb-4' />
                    <p className='text-slate-500 text-sm italic'>
                      Ще немає нотаток...
                    </p>
                  </div>
                ) : (
                  [...(job.notes || [])]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((note) => (
                      <div
                        key={note.id}
                        className='group bg-white/[0.01] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all'
                      >
                        <div className='flex justify-between items-start mb-3'>
                          <p className='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>
                            {new Date(note.createdAt).toLocaleDateString(
                              'uk-UA',
                              { day: 'numeric', month: 'long' }
                            )}
                          </p>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className='text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer'
                          >
                            <Trash2 className='w-3.5 h-3.5' />
                          </button>
                        </div>
                        <p className='text-sm text-slate-300 leading-relaxed'>
                          {note.text}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300 h-full'>
              {!job.aiInsights && !isGeneratingAI ? (
                <div className='text-center py-8 md:py-16 bg-purple-500/5 rounded-3xl border border-purple-500/10'>
                  <div className='w-12 h-12 md:w-16 md:h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <BrainCircuit className='w-6 h-6 md:w-8 md:h-8 text-purple-500' />
                  </div>
                  <h3 className='text-white font-bold mb-2'>AI Підготовка</h3>
                  <p className='text-slate-500 text-xs mb-8 max-w-xs mx-auto px-4'>
                    ШІ проаналізує вакансію і підготує персональний план:
                    питання та Elevator Pitch.
                  </p>
                  <button
                    onClick={handleGenerateAI}
                    className='px-6 py-3 md:px-8 md:py-4 bg-purple-600 hover:bg-purple-500 text-white text-[10px] md:text-xs font-black rounded-2xl transition-all shadow-xl shadow-purple-600/20 flex items-center gap-2 mx-auto cursor-pointer'
                  >
                    <Wand2 className='w-4 h-4' /> ЗГЕНЕРУВАТИ
                  </button>
                </div>
              ) : isGeneratingAI ? (
                <div className='text-center py-20'>
                  <div className='relative w-20 h-20 mx-auto mb-8'>
                    <div className='absolute inset-0 bg-purple-500/20 rounded-full animate-ping' />
                    <div className='relative flex items-center justify-center w-full h-full'>
                      <Sparkles className='w-10 h-10 text-purple-500 animate-bounce' />
                    </div>
                  </div>
                  <h3 className='text-purple-400 font-bold animate-pulse'>
                    ШІ готує персональні поради...
                  </h3>
                </div>
              ) : (
                <div className='bg-white/[0.01] border border-white/5 rounded-3xl p-6 relative'>
                  <div className='flex items-center gap-2 mb-6'>
                    <Sparkles className='w-3.5 h-3.5 text-purple-500' />
                    <span className='text-[10px] font-black uppercase tracking-widest text-purple-500'>
                      AI INSIGHTS
                    </span>
                  </div>
                  <div className='text-slate-300 text-sm leading-relaxed prose prose-invert prose-p:mb-4 prose-headings:text-purple-400 prose-headings:mt-6 prose-headings:mb-2 prose-ul:list-disc prose-ul:pl-4'>
                    <ReactMarkdown>{job.aiInsights}</ReactMarkdown>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    className='mt-8 text-[10px] text-slate-600 hover:text-purple-400 font-bold uppercase tracking-widest transition-colors cursor-pointer'
                  >
                    Оновити аналіз
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'events' && (
            <div className='p-6 space-y-8 relative max-w-lg mx-auto'>
              {/* Вертикальна лінія */}
              <div className='absolute left-[2.25rem] top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent' />

              {[...(job.history || [])]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((event) => {
                  const config =
                    STATUS_CONFIG[event.status] || STATUS_CONFIG['Backlog'];
                  return (
                    <div
                      key={event.id}
                      className='relative flex gap-6 items-start group animate-in fade-in slide-in-from-left-4 duration-500'
                    >
                      {/* Точка на таймлайні */}
                      <div
                        className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-white/5 ${config.color} shadow-2xl group-hover:scale-110 transition-transform`}
                      >
                        <config.icon className='w-4 h-4' />
                      </div>

                      <div className='flex-1 pt-1'>
                        <div className='flex items-center justify-between gap-4 mb-1'>
                          <h4 className='text-[10px] font-black text-white uppercase tracking-widest'>
                            {config.label}
                          </h4>
                          <time className='text-[9px] text-slate-500 font-bold uppercase'>
                            {new Date(event.createdAt).toLocaleString('uk-UA', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </time>
                        </div>
                        <p className='text-xs text-slate-400 leading-relaxed'>
                          Статус вакансії змінено на{' '}
                          <span className={`font-bold ${config.color}`}>
                            {event.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              {(job.history || []).length === 0 && (
                <div className='text-center py-12'>
                  <p className='text-slate-500 text-xs italic'>
                    Історія статусів ще порожня...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className='p-3 md:p-6 bg-slate-950/50 border-t border-white/5 shrink-0'>
          <div className='flex flex-col gap-3 md:gap-6'>
            <div>
              <p className='text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2'>
                Змінити статус
              </p>
              <div className='flex flex-wrap gap-1.5 md:gap-2'>
                {COLUMNS.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[9px] md:text-xs font-bold transition-all cursor-pointer ${
                      job.status === status
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex items-center justify-between pt-4 border-t border-white/5'>
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className='flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-xs md:text-sm font-bold group cursor-pointer'
                >
                  <Trash2 className='w-4 h-4' /> Видалити вакансію
                </button>
              ) : (
                <div className='flex items-center gap-4 bg-red-500/10 p-2 md:p-3 px-3 md:px-4 rounded-2xl border border-red-500/20 flex-1'>
                  <p className='text-red-200 text-[10px] md:text-xs font-bold flex-1'>
                    Видалити назавжди?
                  </p>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className='text-slate-400 text-[10px] md:text-xs font-bold px-2 cursor-pointer'
                    >
                      НІ
                    </button>
                    <button
                      onClick={handleDeleteJob}
                      disabled={isDeleting}
                      className='px-3 py-1 md:px-4 md:py-1.5 bg-red-600 text-white text-[10px] md:text-xs font-black rounded-xl cursor-pointer'
                    >
                      {isDeleting ? '...' : 'ТАК'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

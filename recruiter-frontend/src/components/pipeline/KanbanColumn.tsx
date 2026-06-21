import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { CandidatePipeline, PipelineStage } from '@/lib/api';

interface KanbanColumnProps {
  stage: PipelineStage;
  candidates: CandidatePipeline[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  selectionMode: boolean;
}

export function KanbanColumn({ stage, candidates, selectedIds, onToggleSelect, selectionMode }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const getStageStyles = (stage: PipelineStage) => {
    switch (stage) {
      case PipelineStage.APPLIED: 
        return {
          bg: 'bg-neutral-900/40 border-neutral-800',
          header: 'bg-gradient-to-r from-neutral-800 to-neutral-700',
          text: 'text-neutral-300'
        };
      case PipelineStage.ASSESSED: 
        return {
          bg: 'bg-indigo-950/20 border-indigo-900/40',
          header: 'bg-gradient-to-r from-indigo-900/80 to-indigo-800/60',
          text: 'text-indigo-200'
        };
      case PipelineStage.INTERVIEWED: 
        return {
          bg: 'bg-amber-950/20 border-amber-900/40',
          header: 'bg-gradient-to-r from-amber-900/80 to-amber-800/60',
          text: 'text-amber-200'
        };
      case PipelineStage.OFFER: 
        return {
          bg: 'bg-emerald-950/20 border-emerald-900/40',
          header: 'bg-gradient-to-r from-emerald-900/80 to-emerald-800/60',
          text: 'text-emerald-200'
        };
      case PipelineStage.REJECTED: 
        return {
          bg: 'bg-rose-950/20 border-rose-900/40',
          header: 'bg-gradient-to-r from-rose-900/80 to-rose-800/60',
          text: 'text-rose-200'
        };
      default: 
        return {
          bg: 'bg-neutral-900/40 border-neutral-800',
          header: 'bg-gradient-to-r from-neutral-800 to-neutral-700',
          text: 'text-neutral-300'
        };
    }
  };

  const styles = getStageStyles(stage);

  return (
    <div 
      className={`
        flex flex-col min-w-[320px] w-[320px] rounded-2xl border backdrop-blur-xl transition-all duration-300
        ${styles.bg} 
        ${isOver ? 'ring-2 ring-white/20 shadow-2xl scale-[1.01]' : 'shadow-lg'}
      `}
    >
      <div className={`flex items-center justify-between px-5 py-4 rounded-t-2xl border-b border-white/5 ${styles.header}`}>
        <h3 className={`font-bold uppercase tracking-widest text-xs ${styles.text}`}>
          {stage}
        </h3>
        <span className="bg-black/40 text-white/80 text-xs px-2.5 py-1 rounded-full font-mono shadow-inner border border-white/5">
          {candidates.length}
        </span>
      </div>

      <div 
        ref={setNodeRef} 
        className={`flex-1 min-h-[200px] p-4 transition-colors duration-200 ${isOver ? 'bg-white/[0.02]' : ''}`}
      >
        <SortableContext
          items={candidates.map(c => c.candidateId)}
          strategy={verticalListSortingStrategy}
        >
          {candidates.map(candidate => (
            <KanbanCard
              key={candidate.candidateId}
              candidate={candidate}
              isSelected={selectedIds.has(candidate.candidateId)}
              onToggleSelect={onToggleSelect}
              selectionMode={selectionMode}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

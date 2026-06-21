import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CandidatePipeline } from '@/lib/api';
import { CheckSquare, Square, GripVertical, Clock } from 'lucide-react';

interface KanbanCardProps {
  candidate: CandidatePipeline;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectionMode?: boolean;
  isOverlay?: boolean;
}

export function KanbanCard({ 
  candidate, 
  isSelected = false, 
  onToggleSelect, 
  selectionMode = false,
  isOverlay = false
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: candidate.candidateId,
    data: { candidate } 
  });

  // If this card is currently being dragged from the sortable context, hide it to leave an empty slot.
  // The actual dragged visual will be handled by the DragOverlay which sets isOverlay=true.
  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={{ transition, transform: CSS.Transform.toString(transform) }}
        className="h-[104px] w-full bg-neutral-800/30 border-2 border-dashed border-neutral-600 rounded-xl mb-3"
      />
    );
  }

  const style = isOverlay 
    ? {
        transform: 'rotate(3deg) scale(1.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        zIndex: 999,
        cursor: 'grabbing'
      }
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`
        group relative flex flex-col p-4 mb-3 rounded-xl border backdrop-blur-md transition-all duration-200
        ${isOverlay ? 'bg-neutral-800/90 border-neutral-600 ring-2 ring-amber-500/50' : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50'}
        ${isSelected ? 'ring-2 ring-amber-500 bg-amber-950/20 border-amber-500/50' : ''}
      `}
    >
      <div className="flex gap-3 items-start w-full">
        {selectionMode && onToggleSelect && (
          <div 
            className="pt-0.5 cursor-pointer z-10 transition-transform active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(candidate.candidateId);
            }}
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-amber-500" />
            ) : (
              <Square className="w-5 h-5 text-neutral-500 hover:text-neutral-400" />
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-neutral-100 text-sm truncate tracking-wide">
            {candidate.candidateName}
          </h4>
          <p className="text-[11px] text-neutral-500 font-mono mt-1 tracking-wider truncate">
            {candidate.candidateId}
          </p>
        </div>

        {/* Drag Handle */}
        <div 
          className={`
            p-1.5 -mr-1.5 -mt-1 rounded-md text-neutral-600 transition-colors
            ${isOverlay ? 'cursor-grabbing text-amber-500' : 'cursor-grab active:cursor-grabbing hover:bg-neutral-700/50 hover:text-neutral-300'}
          `}
          {...(!isOverlay ? attributes : {})}
          {...(!isOverlay ? listeners : {})}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-medium text-neutral-500 uppercase tracking-widest border-t border-neutral-800/50 pt-3">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-neutral-600" />
          {new Date(candidate.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-amber-500/10 text-amber-500' : 'bg-neutral-800 text-neutral-400'}`}>
          Active
        </span>
      </div>
    </div>
  );
}

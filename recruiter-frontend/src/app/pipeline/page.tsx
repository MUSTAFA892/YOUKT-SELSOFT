"use client";

import { useEffect, useState } from "react";
import { 
  fetchPipeline, 
  updatePipelineStage, 
  bulkUpdatePipelineStage, 
  bulkSendEmail,
  CandidatePipeline, 
  PipelineStage 
} from "@/lib/api";
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/pipeline/KanbanColumn";
import { KanbanCard } from "@/components/pipeline/KanbanCard";
import { Loader2, Users, Mail, CheckSquare, Trash2, X, ClipboardList } from "lucide-react";

export default function PipelinePage() {
  const [candidates, setCandidates] = useState<CandidatePipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drag and drop state
  const [activeCandidate, setActiveCandidate] = useState<CandidatePipeline | null>(null);

  // Bulk actions state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    loadPipeline();
  }, []);

  async function loadPipeline() {
    try {
      setIsLoading(true);
      const data = await fetchPipeline();
      setCandidates(data);
    } catch (e) {
      console.error("Failed to load pipeline", e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidate = candidates.find(c => c.candidateId === active.id);
    if (candidate) {
      setActiveCandidate(candidate);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCandidate(null);
    const { active, over } = event;
    if (!over) return;

    const candidateId = active.id as string;
    let newStage = over.id as PipelineStage;

    // If dropped over another candidate, resolve the newStage to that candidate's stage
    const overCandidate = candidates.find(c => c.candidateId === over.id);
    if (overCandidate) {
      newStage = overCandidate.stage;
    }

    // Ensure resolved stage is valid before updating
    const validStages = Object.values(PipelineStage);
    if (!validStages.includes(newStage)) {
      console.warn("Could not resolve a valid stage for drop target:", over.id);
      return;
    }

    const candidate = candidates.find(c => c.candidateId === candidateId);
    if (!candidate) return;

    // Handle reordering within the same stage
    if (candidate.stage === newStage) {
      if (overCandidate && candidateId !== overCandidate.candidateId) {
        setCandidates(prev => {
          const oldIndex = prev.findIndex(c => c.candidateId === candidateId);
          const newIndex = prev.findIndex(c => c.candidateId === overCandidate.candidateId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
      return;
    }

    // Optimistic update for moving between stages
    setCandidates(prev => {
      // First change the stage
      const updated = prev.map(c => 
        c.candidateId === candidateId ? { ...c, stage: newStage } : c
      );
      
      // If we dropped over a specific candidate, reorder so it lands exactly there
      if (overCandidate) {
        const activeIndex = updated.findIndex(c => c.candidateId === candidateId);
        const overIndex = updated.findIndex(c => c.candidateId === overCandidate.candidateId);
        return arrayMove(updated, activeIndex, overIndex);
      }
      return updated;
    });

    try {
      await updatePipelineStage(candidateId, newStage);
    } catch (e) {
      console.error("Failed to update stage", e);
      // Revert on failure
      loadPipeline();
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkMove = async (stage: PipelineStage) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkUpdatePipelineStage(Array.from(selectedIds), stage);
      setSelectedIds(new Set());
      setSelectionMode(false);
      loadPipeline();
    } catch (e) {
      console.error("Bulk move failed", e);
    }
  };

  const handleBulkEmail = async () => {
    if (selectedIds.size === 0) return;
    try {
      await bulkSendEmail(Array.from(selectedIds), "Update on your application", "Please log in to see your status.");
      alert(`Emails sent to ${selectedIds.size} candidates.`);
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (e) {
      console.error("Bulk email failed", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  const stages = Object.values(PipelineStage);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#050505] text-neutral-200 p-8 overflow-x-hidden relative">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-6 h-6 text-amber-500" />
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
                Pipeline
              </h1>
            </div>
            <p className="text-neutral-400 text-sm max-w-lg">
              Manage your candidate workflow with ease. Drag and drop candidates to update stages, or use bulk actions to streamline communication.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {selectionMode ? (
              <div className="flex items-center gap-3 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 rounded-xl p-2 shadow-2xl">
                <span className="text-sm font-bold text-amber-500 px-4 bg-amber-500/10 rounded-lg py-2">
                  {selectedIds.size} selected
                </span>
                
                <select 
                  className="bg-neutral-800/80 border border-neutral-600 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer text-white"
                  onChange={(e) => {
                    if (e.target.value) handleBulkMove(e.target.value as PipelineStage);
                    e.target.value = ""; // reset
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Move to stage...</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <button 
                  onClick={handleBulkEmail}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25 text-sm font-medium"
                  title="Send Bulk Email"
                >
                  <Mail className="w-4 h-4" /> Email
                </button>

                <div className="w-px h-8 bg-neutral-700/50 mx-1" />

                <button 
                  onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  title="Cancel Selection"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSelectionMode(true)}
                className="flex items-center gap-2 bg-neutral-900/60 backdrop-blur-md border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/80 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg text-sm font-medium"
              >
                <CheckSquare className="w-4 h-4 text-amber-500" /> Bulk Actions
              </button>
            )}
          </div>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-12 pt-4 px-4 -mx-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent snap-x">
            {stages.map(stage => (
              <div key={stage} className="snap-start">
                <KanbanColumn
                  stage={stage}
                  candidates={candidates.filter(c => c.stage === stage)}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  selectionMode={selectionMode}
                />
              </div>
            ))}
          </div>
          
          <DragOverlay dropAnimation={{
              duration: 250,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
            {activeCandidate ? (
              <KanbanCard 
                candidate={activeCandidate} 
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

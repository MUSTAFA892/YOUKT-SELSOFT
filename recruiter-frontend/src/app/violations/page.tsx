"use client";

import { useEffect, useState } from "react";
import { getTabSwitchIncidents, type TabSwitchIncident } from "@/lib/api";
import { Loader2, AlertTriangle } from "lucide-react";
import TabSwitchReport from "@/components/TabSwitchReport";
import { useAuth } from "@/components/AuthProvider";

export default function ViolationsPage() {
  const { currentUser, getRecruiterCandidates } = useAuth();
  const [incidents, setIncidents] = useState<TabSwitchIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "terminated" | "warning">("all");

  useEffect(() => {
    async function loadIncidents() {
      try {
        const data = await getTabSwitchIncidents();
        
        // Filter to only show this recruiter's candidates
        const recruiterCandidateIds = new Set(
          getRecruiterCandidates(currentUser.id).map(c => c.id)
        );
        
        const filteredData = data.filter((incident: TabSwitchIncident) =>
          recruiterCandidateIds.has(incident.candidateId)
        );
        
        setIncidents(filteredData);
      } catch (e) {
        console.error("Failed to load tab switch incidents", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadIncidents();
  }, [currentUser, getRecruiterCandidates]);

  const filteredIncidents = incidents.filter((i) => {
    if (filter === "all") return true;
    return i.status === filter;
  });

  const stats = {
    totalViolations: incidents.length,
    terminated: incidents.filter((i) => i.status === "terminated").length,
    warnings: incidents.filter((i) => i.status === "warning").length,
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-950 text-neutral-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h1 className="text-3xl font-bold text-white">Integrity Violations</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Total Violations
            </div>
            <div className="text-4xl font-bold text-white">{stats.totalViolations}</div>
          </div>

          <div className="bg-red-500/5 border border-red-500/50 rounded-2xl p-6">
            <div className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">
              Terminated Sessions
            </div>
            <div className="text-4xl font-bold text-red-300">{stats.terminated}</div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/50 rounded-2xl p-6">
            <div className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
              Warnings
            </div>
            <div className="text-4xl font-bold text-amber-300">{stats.warnings}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          {(["all", "terminated", "warning"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === filterOption
                  ? filterOption === "terminated"
                    ? "bg-red-600 text-white"
                    : filterOption === "warning"
                    ? "bg-amber-600 text-white"
                    : "bg-indigo-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              {filterOption === "all" && "All Violations"}
              {filterOption === "terminated" && "Terminated"}
              {filterOption === "warning" && "Warnings"}
            </button>
          ))}
        </div>

        {/* Incidents List */}
        {filteredIncidents.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-lg">No violations found</p>
          </div>
        ) : (
          <TabSwitchReport incidents={filteredIncidents} />
        )}
      </div>
    </div>
  );
}

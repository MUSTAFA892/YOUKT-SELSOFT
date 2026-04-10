import { TabSwitchIncident } from "@/lib/api";
import { AlertTriangle, Clock, User, Book, CheckCircle2 } from "lucide-react";

export default function TabSwitchReport({ incidents }: { incidents: TabSwitchIncident[] }) {
  if (incidents.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <p className="text-neutral-400">No tab switch violations detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className={`border rounded-xl p-6 ${
            incident.status === 'terminated'
              ? 'bg-red-500/5 border-red-500/50'
              : 'bg-amber-500/5 border-amber-500/50'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  incident.status === 'terminated'
                    ? 'bg-red-500/20'
                    : 'bg-amber-500/20'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    incident.status === 'terminated'
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                />
              </div>
              <div>
                <h3 className="font-bold text-white">{incident.candidateName}</h3>
                <p className="text-xs text-neutral-400">ID: {incident.candidateId}</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                incident.status === 'terminated'
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {incident.status === 'terminated' ? '🚫 Terminated' : '⚠️ Warning'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4 text-neutral-500" />
              <div className="text-xs">
                <p className="text-neutral-500">Problem</p>
                <p className="text-white font-semibold truncate">{incident.problemTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neutral-500" />
              <div className="text-xs">
                <p className="text-neutral-500">Switches</p>
                <p className="text-white font-semibold">{incident.switchCount}/3</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              <div className="text-xs">
                <p className="text-neutral-500">First Detection</p>
                <p className="text-white font-semibold">
                  {new Date(incident.details.firstSwitchAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              <div className="text-xs">
                <p className="text-neutral-500">Last Detection</p>
                <p className="text-white font-semibold">
                  {new Date(incident.details.lastSwitchAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400">
            Recorded: {new Date(incident.recordedAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

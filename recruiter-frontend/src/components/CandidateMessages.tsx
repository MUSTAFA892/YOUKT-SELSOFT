"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  X, 
  User, 
  Bot, 
  MessageSquare, 
  HeadphonesIcon,
  Loader2,
  Clock,
  Calendar
} from "lucide-react";
import { HelpMessage, getConversation, sendChatMessage } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

interface CandidateMessagesProps {
  candidateId: string;
  candidateName: string;
  interviewId: string;
  recruiterId: string;
  recruiterName: string;
  onClose: () => void;
}

export default function CandidateMessages({
  candidateId,
  candidateName,
  interviewId,
  recruiterId,
  recruiterName,
  onClose
}: CandidateMessagesProps) {
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { unreadHelpRequests, leftTestNotifications } = useAuth();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
    const interval = setInterval(loadConversation, 5000); // Poll for candidate messages
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversation = async () => {
    try {
      const conv = await getConversation(candidateId, interviewId);
      setMessages(conv.messages);
    } catch (e) {
      console.error("Failed to load conversation", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const content = inputValue;
    setInputValue("");
    setIsSending(true);

    try {
      await sendChatMessage(candidateId, interviewId, {
        senderId: recruiterId,
        senderName: recruiterName,
        senderType: 'recruiter',
        content: content
      });
      await loadConversation();
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{candidateName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{candidateId}</span>
                {unreadHelpRequests.includes(candidateId) && (
                  <>
                    <span className="text-neutral-700 font-bold">•</span>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                      Live Help Required
                    </span>
                  </>
                )}
                {leftTestNotifications.includes(candidateId) && (
                  <>
                    <span className="text-neutral-700 font-bold">•</span>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Left/Quit Test
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-950/30 scrollbar-thin scrollbar-thumb-neutral-800"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
              <MessageSquare className="w-16 h-16 text-neutral-700" />
              <p className="text-sm font-medium text-neutral-500">No messages in this conversation yet.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={msg.id || i}
                className={`flex ${msg.senderType === 'recruiter' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-[80%]">
                  <div className={`flex items-center gap-2 mb-1.5 px-1 ${msg.senderType === 'recruiter' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{msg.senderName}</span>
                    <span className="text-[10px] text-neutral-600 font-medium">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`rounded-2xl px-5 py-3.5 shadow-xl ${
                    msg.senderType === 'recruiter'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : msg.senderType === 'ai'
                      ? 'bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-tl-none italic'
                      : 'bg-neutral-800 text-white rounded-tl-none border border-neutral-700'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your response to the candidate..."
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-30 transition-all active:scale-90 shadow-lg"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-4 text-[10px] text-neutral-600 text-center font-bold uppercase tracking-[0.2em]">
            Responses are sent instantly to the candidate's Help Center
          </p>
        </div>
      </div>
    </div>
  );
}

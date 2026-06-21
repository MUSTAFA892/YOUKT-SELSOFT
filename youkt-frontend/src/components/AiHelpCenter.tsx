"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  User, 
  Send, 
  X, 
  MessageSquare, 
  Sparkles, 
  Loader2, 
  Info,
  ChevronDown,
  HeadphonesIcon
} from "lucide-react";
import { HelpMessage, getConversation, sendChatMessage, getAiAssistance } from "@/lib/api";

interface AiHelpCenterProps {
  candidateId: string;
  candidateName: string;
  interviewId: string;
  currentQuestion: any;
}

export default function AiHelpCenter({ 
  candidateId, 
  candidateName, 
  interviewId, 
  currentQuestion 
}: AiHelpCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'ai' | 'recruiter'>('ai');
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const loadConversation = async () => {
    setIsLoading(true);
    try {
      const conv = await getConversation(candidateId, interviewId);
      setMessages(conv.messages);
      
      // If there are existing messages that aren't from AI, suggest switching to recruiter mode
      // But we let the user manually switch via the toggle now
      const hasRecruiterInvolvement = conv.messages.some(m => m.senderType === 'recruiter');
      if (hasRecruiterInvolvement && mode === 'ai') {
        // Only auto-switch if they just opened it, otherwise respect their toggle choice
        setMode('recruiter');
      }
    } catch (e) {
      console.error("Failed to load conversation", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiAction = async (actionText: string) => {
    if (actionText === "Speak to recruiter") {
      setMode('recruiter');
      return;
    }

    setIsTyping(true);
    try {
      const result = await getAiAssistance({
        query: actionText,
        questionContext: currentQuestion,
        candidateId,
        interviewId,
        candidateName
      });

      if (result.status === 'switching_to_recruiter') {
        setMode('recruiter');
        // Add a system message locally to show transition
        const transitionMsg: HelpMessage = {
          id: 'system_' + Date.now(),
          senderId: 'system',
          senderName: 'System',
          senderType: 'ai',
          content: "I'm connecting you with a recruiter now as this requires human assistance. Please wait...",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, {
          id: 'user_' + Date.now(),
          senderId: candidateId,
          senderName: candidateName,
          senderType: 'candidate',
          content: actionText,
          timestamp: new Date().toISOString()
        }, transitionMsg]);
      } else if (result.data) {
        // Re-load to get the actual IDs from backend
        await loadConversation();
      }
    } catch (e) {
      console.error("AI Assist failed", e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRecruiterSend = async () => {
    if (!inputValue.trim()) return;

    const userQuery = inputValue;
    setInputValue("");

    try {
      await sendChatMessage(candidateId, interviewId, {
        senderId: candidateId,
        senderName: candidateName,
        senderType: 'candidate',
        content: userQuery
      });
      await loadConversation();
    } catch (e) {
      console.error("Send message failed", e);
    }
  };

  // Poll for recruiter replies if in recruiter mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && mode === 'recruiter') {
      interval = setInterval(loadConversation, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, mode]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2 p-1 pl-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/20`}
      >
        <span className="text-xs font-bold tracking-tight uppercase">Help Center</span>
        <div className="bg-white/10 p-2.5 rounded-full backdrop-blur-md">
          {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        </div>
        
        {/* Animated pulse for notification feel */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-neutral-950 animate-bounce"></span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[600px] bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg active:rotate-12 transition-transform">
                {mode === 'ai' ? <Sparkles className="w-5 h-5 text-white" /> : <HeadphonesIcon className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  {mode === 'ai' ? 'AI Assistant' : 'Recruiter Support'}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Online Now</span>
                </div>
              </div>
            </div>
            
            {/* Clickable Switcher */}
            <div className="flex bg-neutral-800/50 p-1 rounded-xl border border-white/5 cursor-pointer">
              <div 
                onClick={() => setMode('ai')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'ai' ? 'bg-indigo-500 text-white shadow-md' : 'text-neutral-500 hover:text-white'}`}
              >
                AI
              </div>
              <div 
                onClick={() => setMode('recruiter')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'recruiter' ? 'bg-purple-500 text-white shadow-md' : 'text-neutral-500 hover:text-white'}`}
              >
                Human
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
          >
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <Bot className="w-12 h-12 text-indigo-400" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">How can I help you?</p>
                  <p className="text-[10px] text-neutral-400 max-w-[200px]">I can clarify questions, check for errors, or find a recruiter for you.</p>
                </div>
              </div>
            )}

            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            )}

            {messages.map((msg, i) => (
              <div 
                key={msg.id || i}
                className={`flex ${msg.senderType === 'candidate' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                  msg.senderType === 'candidate' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : msg.senderType === 'ai'
                    ? 'bg-white/10 text-neutral-100 rounded-bl-none border border-white/10'
                    : 'bg-purple-600/90 text-white rounded-bl-none'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1 opacity-60">
                    <span className="text-[9px] font-black uppercase tracking-wider">{msg.senderName}</span>
                    <span className="text-[9px] font-medium">•</span>
                    <span className="text-[9px] font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="p-5 bg-white/5 border-t border-white/10">
            {mode === 'ai' ? (
              // AI Mode: No input box, just preset action buttons
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleAiAction("Clarify question")} disabled={isTyping} className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-300 transition-colors text-left shadow-sm">
                    Clarify question
                  </button>
                  <button onClick={() => handleAiAction("Clarify the question like to a kid")} disabled={isTyping} className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-300 transition-colors text-left shadow-sm">
                    Clarify like to a kid
                  </button>
                  <button onClick={() => handleAiAction("Find errors in questions")} disabled={isTyping} className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-300 transition-colors text-left shadow-sm">
                    Find errors in questions
                  </button>
                  <button onClick={() => handleAiAction("Help with testcases")} disabled={isTyping} className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-300 transition-colors text-left shadow-sm">
                    Help with testcases
                  </button>
                </div>
                <button onClick={() => handleAiAction("Speak to recruiter")} className="w-full px-3 py-2.5 mt-1 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/30 rounded-xl text-xs font-black text-purple-300 transition-colors text-center shadow-sm flex items-center justify-center gap-2 uppercase tracking-widest">
                  <HeadphonesIcon className="w-4 h-4" /> Speak to recruiter
                </button>
              </div>
            ) : (
              // Recruiter Mode: Free text input
              <div className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRecruiterSend()}
                  placeholder="Send a message to recruiter..."
                  className="w-full bg-neutral-950/50 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
                />
                <button
                  onClick={handleRecruiterSend}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1.5 p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-20 transition-all active:scale-90 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-2">
              <Info className="w-3 h-3 text-neutral-600" />
              <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Your conversation is strictly private</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
